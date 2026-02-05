import { Queue, Worker } from 'bullmq';
import { createLogger } from '../../common/logger';
import { attendanceSettingsService } from './attendance-settings.service';
import { prisma } from '../../common/db/prisma';
import dayjs from 'dayjs';
import { AttendanceCalculator } from './domain/attendance-calculator';
import { CorrectionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('AttendanceScheduler');

// Parse Redis config
const redisConfig = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

import IORedis from 'ioredis';
// const connection = new IORedis(redisConfig as any, { maxRetriesPerRequest: null });

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
    const days = end.diff(start, 'day') + 1;

    // Initial status
    const status = {
      id: batchId,
      status: 'processing',
      total: days,
      completed: 0,
      failed: 0,
      message: 'Calculation started'
    };

    if (this.connection) {
        await this.connection.set(`attendance:batch:${batchId}`, JSON.stringify(status), 'EX', 3600);
    }

    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      await this.queue.add('daily-calculation', {
        date: dateStr,
        employeeIds: data.employeeIds,
        batchId
      });
      current = current.add(1, 'day');
    }
    
    logger.info({ startDate: data.startDate, endDate: data.endDate, batchId }, 'Triggered manual calculation jobs');
    return batchId;
  }

  async getBatchStatus(batchId: string) {
    if (!this.connection) return null;
    const data = await this.connection.get(`attendance:batch:${batchId}`);
    if (!data) return null;

    const status = JSON.parse(data);
    const progress = status.total > 0 
      ? Math.round(((status.completed + status.failed) / status.total) * 100) 
      : 0;

    return { ...status, progress };
  }

  async updateBatchStatus(batchId: string, type: 'completed' | 'failed') {
      if (!this.connection) return;
      const key = `attendance:batch:${batchId}`;
      const data = await this.connection.get(key);
      if (!data) return;
      
      const status = JSON.parse(data);
      if (type === 'completed') status.completed++;
      if (type === 'failed') status.failed++;
      
      if (status.completed + status.failed >= status.total) {
          status.status = status.failed > 0 ? 'completed_with_errors' : 'completed';
          status.message = 'Calculation finished';
      }
      
      await this.connection.set(key, JSON.stringify(status), 'EX', 3600);
  }

  async processDailyCalculation(data: { date?: string, employeeIds?: number[] }) {
    const dateStr = data.date || dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    // Use UTC to ensure consistent date storage (YYYY-MM-DD 00:00:00 UTC)
    const targetDate = dayjs.utc(dateStr).startOf('day').toDate();
    const nextDate = dayjs.utc(dateStr).add(1, 'day').startOf('day').toDate();
    
    logger.info({ date: dateStr, targetDate }, 'Starting daily calculation');

    // Find employees to calculate
    const where: any = {};
    if (data.employeeIds && data.employeeIds.length > 0) {
      where.id = { in: data.employeeIds };
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
    logger.info({ employeeId, date }, 'Ensuring daily record exists');
    // 1. Check if exists
    const exists = await prisma.attDailyRecord.findFirst({
      where: { 
        employeeId, 
        workDate: date 
      }
    });
    if (exists) {
        logger.info('Record already exists');
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
        logger.info('No schedule found');
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
    
    logger.info({ dayOfCycle, periods: schedule.shift.periods.length }, 'Checking periods');

    // 4. Find periods for this day
    const shiftPeriods = schedule.shift.periods.filter(p => p.dayOfCycle === dayOfCycle);
    
    if (shiftPeriods.length === 0) {
        logger.info('No periods for this day');
        return;
    }

    // 5. Create records
    for (const sp of shiftPeriods) {
       logger.info({ periodId: sp.periodId }, 'Creating daily record');
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
