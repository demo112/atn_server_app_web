import { Queue, Worker } from 'bullmq';
import { createLogger } from '../../common/logger';
import { attendanceSettingsService } from './attendance-settings.service';
import { prisma } from '../../common/db/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AttendanceCalculator } from './domain/attendance-calculator';
import { CorrectionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import IORedis from 'ioredis';

dayjs.extend(utc);

const logger = createLogger('AttendanceScheduler');

// Parse Redis config
const redisConfig = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

export class AttendanceScheduler {
  private queue: Queue | undefined;
  private worker: Worker | undefined;
  private calculator: AttendanceCalculator;
  private connection: IORedis | undefined;

  constructor() {
    this.calculator = new AttendanceCalculator();
  }

  async init() {
    // Lazy init Redis connection
    if (!this.connection) {
       try {
         this.connection = await this.createRedisConnection();
       } catch (err) {
         logger.warn({ err: err instanceof Error ? err.message : String(err) }, 'Failed to initialize Redis connection. Attendance Scheduler will be disabled.');
         return;
       }
       
       this.connection.on('error', (err) => {
         logger.error({ err }, 'Redis connection error');
       });

       this.queue = new Queue('attendance-calculation', { connection: this.connection });
       
       this.worker = new Worker('attendance-calculation', async (job) => {
        logger.info({ jobId: job.id, name: job.name }, 'Processing job');
        if (job.name === 'daily-calculation') {
          await this.processDailyCalculation(job.data);
        }
      }, { connection: this.connection });

      this.worker.on('completed', async (job) => {
        logger.info({ jobId: job.id }, 'Job completed');
        if (job.data && job.data.batchId) {
            await this.updateBatchStatus(job.data.batchId, 'completed');
        }
      });

      this.worker.on('failed', async (job, err) => {
        logger.error({ jobId: job?.id, err }, 'Job failed');
        if (job?.data && job.data.batchId) {
            await this.updateBatchStatus(job.data.batchId, 'failed');
        }
      });
    }

    // Schedule daily job based on settings
    await this.scheduleDailyJob();
    logger.info('Attendance Scheduler initialized');
  }

  async scheduleDailyJob() {
    if (!this.queue) return;
    const settings = await attendanceSettingsService.getSettings();
    const time = settings.auto_calc_time || '05:00';
    const [hour, minute] = time.split(':').map(Number);
    
    // Remove existing repeatable jobs to reschedule
    const jobs = await this.queue.getRepeatableJobs();
    for (const job of jobs) {
      await this.queue.removeRepeatableByKey(job.key);
    }

    // Add new repeatable job
    // Cron pattern: minute hour * * *
    const cron = `${minute} ${hour} * * *`;
    await this.queue.add('daily-calculation', {}, {
      repeat: { pattern: cron },
    });
    
    logger.info({ cron }, 'Scheduled daily calculation job');
  }

  /**
   * 手动触发计算任务
   */
  async triggerCalculation(data: { startDate: string; endDate: string; employeeIds?: number[] }): Promise<string> {
    if (!this.queue) {
      logger.warn('Attendance scheduler not initialized, skipping calculation trigger');
      throw new Error('Scheduler not initialized');
    }

    const batchId = uuidv4();
    const start = dayjs(data.startDate);
    const end = dayjs(data.endDate);
    const daysCount = end.diff(start, 'day') + 1;

    // Get all employees to calculate (only IDs for minimal data transfer)
    const empWhere: any = { status: 'active' }; 
    if (data.employeeIds && data.employeeIds.length > 0) {
      empWhere.id = { in: data.employeeIds };
    }
    
    const employees = await prisma.employee.findMany({ 
        where: empWhere,
        select: { id: true }
    });
    
    if (employees.length === 0) {
         throw new Error('No active employees found to calculate');
    }

    const total = daysCount * employees.length;

    // Initial status using Hash for atomic updates
    if (this.connection) {
        const key = `attendance:batch:${batchId}`;
        await this.connection.hmset(key, {
            status: 'processing',
            total: total.toString(),
            completed: '0',
            failed: '0',
            message: 'Calculation started'
        });
        await this.connection.expire(key, 3600);
    }

    // Batch add single-employee jobs
    const jobs = [];
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      
      for (const emp of employees) {
          jobs.push({
              name: 'daily-calculation',
              data: {
                  date: dateStr,
                  employeeId: emp.id,
                  batchId
              }
          });
      }
      current = current.add(1, 'day');
    }
    
    // Chunked add to avoid large payloads
    const CHUNK_SIZE = 500;
    for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
        await this.queue.addBulk(jobs.slice(i, i + CHUNK_SIZE));
    }
    
    logger.info({ startDate: data.startDate, endDate: data.endDate, batchId, totalJobs: total }, 'Triggered manual calculation jobs');
    return batchId;
  }

  async getBatchStatus(batchId: string) {
    if (!this.connection) return null;
    const status = await this.connection.hgetall(`attendance:batch:${batchId}`);
    
    if (!status || Object.keys(status).length === 0) return null;

    const total = parseInt(status.total || '0');
    const completed = parseInt(status.completed || '0');
    const failed = parseInt(status.failed || '0');
    
    const progress = total > 0 
      ? Math.round(((completed + failed) / total) * 100) 
      : 0;

    return { 
        id: batchId,
        status: status.status,
        message: status.message,
        total,
        completed,
        failed,
        progress 
    };
  }

  async updateBatchStatus(batchId: string, type: 'completed' | 'failed') {
      if (!this.connection) return;
      const key = `attendance:batch:${batchId}`;
      
      const field = type === 'completed' ? 'completed' : 'failed';
      await this.connection.hincrby(key, field, 1);
      
      // Check if finished
      const status = await this.connection.hgetall(key);
      if (!status || Object.keys(status).length === 0) return;
      
      const total = parseInt(status.total || '0');
      const completed = parseInt(status.completed || '0');
      const failed = parseInt(status.failed || '0');
      
      if (completed + failed >= total) {
          const finalStatus = failed > 0 ? 'completed_with_errors' : 'completed';
          // Use hset to update status only if not already completed (idempotency check ideal but race condition low risk here)
          // Just overwrite is fine as long as we don't revert from completed
          await this.connection.hmset(key, {
              status: finalStatus,
              message: 'Calculation finished'
          });
      }
  }

  async processDailyCalculation(data: { date?: string, employeeIds?: number[], employeeId?: number, batchId?: string }) {
    const dateStr = data.date || dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    // Use UTC to ensure consistent date storage (YYYY-MM-DD 00:00:00 UTC)
    const targetDate = dayjs.utc(dateStr).startOf('day').toDate();
    const nextDate = dayjs.utc(dateStr).add(1, 'day').startOf('day').toDate();
    
    // Single employee mode (Optimized)
    if (data.employeeId) {
        try {
            await this.ensureDailyRecordExists(data.employeeId, targetDate);
            await this.calculateEmployeeDaily(data.employeeId, targetDate, nextDate);
        } catch (err) {
            logger.error({ employeeId: data.employeeId, date: dateStr, err }, 'Failed to calculate for employee');
            throw err; // Re-throw to trigger job failure handling
        }
        return;
    }

    // Batch mode (Legacy or Schedule)
    logger.info({ date: dateStr, targetDate }, 'Starting daily calculation (batch mode)');

    // Find employees to calculate
    const where: any = {};
    if (data.employeeIds && data.employeeIds.length > 0) {
      where.id = { in: data.employeeIds };
    } else {
        // Only active employees for auto schedule
        where.status = 'active';
    }

    const employees = await prisma.employee.findMany({ where });
    
    let successCount = 0;
    let failCount = 0;

    for (const emp of employees) {
      try {
        await this.ensureDailyRecordExists(emp.id, targetDate);
        await this.calculateEmployeeDaily(emp.id, targetDate, nextDate);
        successCount++;
      } catch (err) {
        logger.error({ employeeId: emp.id, err }, 'Failed to calculate for employee');
        failCount++;
      }
    }
    
    logger.info({ successCount, failCount, date: dateStr }, 'Daily calculation finished');
  }

  async ensureDailyRecordExists(employeeId: number, date: Date) {
    // logger.debug({ employeeId, date }, 'Ensuring daily record exists');
    // 1. Check if exists
    const exists = await prisma.attDailyRecord.findFirst({
      where: { 
        employeeId, 
        workDate: date 
      },
      select: { id: true } // Optimization: select only ID
    });
    if (exists) {
        return;
    }

    // 2. Find schedule
    const schedule = await prisma.attSchedule.findFirst({
      where: {
        employeeId,
        startDate: { lte: date },
        endDate: { gte: date }
      },
      include: {
        shift: {
          include: { periods: true }
        }
      }
    });

    if (!schedule || !schedule.shift) {
        // logger.info('No schedule found');
        return;
    }

    // 3. Calculate day of cycle
    let dayOfCycle = 1;
    if (schedule.shift.cycleDays === 7) {
       // Standard Weekly: 0(Sun) -> 7, 1(Mon) -> 1
       const day = dayjs.utc(date).day(); 
       dayOfCycle = day === 0 ? 7 : day;
    } else {
       // Custom cycle
       const diff = dayjs.utc(date).diff(dayjs.utc(schedule.startDate), 'day');
       dayOfCycle = (diff % schedule.shift.cycleDays) + 1;
    }
    
    // 4. Find periods for this day
    const shiftPeriods = schedule.shift.periods.filter(p => p.dayOfCycle === dayOfCycle);
    
    if (shiftPeriods.length === 0) {
        return;
    }

    // 5. Create records
    for (const sp of shiftPeriods) {
       await prisma.attDailyRecord.create({
         data: {
           employeeId,
           workDate: date,
           shiftId: schedule.shiftId,
           periodId: sp.periodId,
           status: 'normal', // Default, will be recalculated
         }
       });
    }
  }

  async calculateEmployeeDaily(employeeId: number, targetDate: Date, nextDate: Date) {
    // Find record for this day
    const record = await prisma.attDailyRecord.findFirst({
      where: {
        employeeId,
        workDate: {
          gte: targetDate,
          lt: nextDate
        }
      },
      include: {
        period: true,
        shift: true
      }
    });

    if (!record) {
      // No record found. 
      return;
    }

    if (!record.periodId || !record.period) {
       // No period (Rest day or not scheduled), skip
       return;
    }

    // 1. Aggregation: Find Clock Records and Corrections
    const [clockRecords, corrections] = await Promise.all([
      prisma.attClockRecord.findMany({
        where: {
          employeeId,
          clockTime: {
            gte: targetDate,
            lt: nextDate
          }
        }
      }),
      prisma.attCorrection.findMany({
        where: { dailyRecordId: record.id }
      })
    ]);

    // Determine effective Check-In
    let checkInTime: Date | null = null;
    const checkInCorrection = corrections.find(c => c.type === CorrectionType.check_in);
    if (checkInCorrection) {
      checkInTime = checkInCorrection.correctionTime;
    } else {
      const signIns = clockRecords
        .filter(c => c.type === 'sign_in')
        .sort((a, b) => a.clockTime.getTime() - b.clockTime.getTime());
      if (signIns.length > 0) {
        checkInTime = signIns[0].clockTime;
      }
    }

    // Determine effective Check-Out
    let checkOutTime: Date | null = null;
    const checkOutCorrection = corrections.find(c => c.type === CorrectionType.check_out);
    if (checkOutCorrection) {
      checkOutTime = checkOutCorrection.correctionTime;
    } else {
      const signOuts = clockRecords
        .filter(c => c.type === 'sign_out')
        .sort((a, b) => b.clockTime.getTime() - a.clockTime.getTime());
      if (signOuts.length > 0) {
        checkOutTime = signOuts[0].clockTime;
      }
    }

    // Fetch Leaves
    const leaves = await prisma.attLeave.findMany({
      where: {
        employeeId,
        status: 'approved',
        // Overlap with work date
        startTime: { lt: nextDate },
        endTime: { gt: targetDate }
      }
    });

    // 2. Calculation
    // Construct temp record with updated times
    const tempRecord = {
      ...record,
      checkInTime: checkInTime || null,
      checkOutTime: checkOutTime || null
    };

    const result = this.calculator.calculate(tempRecord, record.period, leaves);

    // 3. Update Record
    await prisma.attDailyRecord.update({
      where: { id: record.id },
      data: {
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        status: result.status,
        actualMinutes: result.actualMinutes,
        effectiveMinutes: result.effectiveMinutes,
        lateMinutes: result.lateMinutes,
        earlyLeaveMinutes: result.earlyLeaveMinutes,
        absentMinutes: result.absentMinutes,
        leaveMinutes: result.leaveMinutes,
      }
    });
  }
  private async createRedisConnection(): Promise<IORedis> {
    const config = redisConfig as any;
    
    try {
      return await this.tryConnect(config, 'Primary');
    } catch (error) {
      // Check if primary is already localhost
      const isLocalhost = config.host === 'localhost' || config.host === '127.0.0.1';
      const isDefaultPort = parseInt(String(config.port)) === 6379;

      if (isLocalhost && isDefaultPort) {
         logger.warn('Failed to connect to local Redis. Attendance Scheduler will be disabled.');
         throw error;
      }

      logger.warn({ error }, 'Failed to connect to primary Redis, trying local fallback');
      
      const localConfig = {
        host: '127.0.0.1',
        port: 6379,
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
      };
      
      try {
        return await this.tryConnect(localConfig, 'Local Fallback');
      } catch (fallbackError) {
        logger.error({ fallbackError }, 'Failed to connect to local Redis fallback');
        throw fallbackError;
      }
    }
  }

  private tryConnect(config: any, name: string): Promise<IORedis> {
    return new Promise((resolve, reject) => {
      const redis = new IORedis(config, {
        maxRetriesPerRequest: null,
        retryStrategy: (times) => {
          if (times > 3) {
            return null;
          }
          return Math.min(times * 100, 1000);
        },
        connectTimeout: 5000,
      });

      const onReady = () => {
        cleanup();
        logger.info(`${name} Redis connected successfully`);
        // Restore default retry strategy for stable connection
        (redis as any).options.retryStrategy = (times: number) => {
             return Math.min(times * 50, 2000);
        };
        resolve(redis);
      };

      const onEnd = () => {
        cleanup();
        reject(new Error(`${name} Redis connection failed`));
      };

      const onError = (err: Error) => {
         // Suppress unhandled error logs during probe
      };

      const cleanup = () => {
        redis.removeListener('ready', onReady);
        redis.removeListener('end', onEnd);
        redis.removeListener('error', onError);
      };

      redis.once('ready', onReady);
      redis.once('end', onEnd);
      redis.on('error', onError);
    });
  }
}

export const attendanceScheduler = new AttendanceScheduler();
