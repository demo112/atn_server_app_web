import { Queue, Worker } from 'bullmq';
import { createLogger } from '../../common/logger';
import { attendanceSettingsService } from './attendance-settings.service';
import { prisma } from '../../common/db/prisma';
import dayjs from 'dayjs';
import { AttendanceCalculator } from './domain/attendance-calculator';

const logger = createLogger('AttendanceScheduler');

// Parse Redis config
const redisConfig = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || 'localhost',
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
       this.connection = new IORedis(redisConfig as any, { maxRetriesPerRequest: null });
       
       this.queue = new Queue('attendance-calculation', { connection: this.connection });
       
       this.worker = new Worker('attendance-calculation', async (job) => {
        logger.info({ jobId: job.id, name: job.name }, 'Processing job');
        if (job.name === 'daily-calculation') {
          await this.processDailyCalculation(job.data);
        }
      }, { connection: this.connection });

      this.worker.on('completed', (job) => {
        logger.info({ jobId: job.id }, 'Job completed');
      });

      this.worker.on('failed', (job, err) => {
        logger.error({ jobId: job?.id, err }, 'Job failed');
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
  async triggerCalculation(data: { startDate: string; endDate: string; employeeIds?: number[] }) {
    if (!this.queue) {
      logger.warn('Attendance scheduler not initialized, skipping calculation trigger');
      return;
    }
    // 拆分为每一天的任务，或者在一个任务中处理多天
    // 这里简单起见，直接在后台执行，不进队列（或者进队列异步执行）
    // 为了利用 Worker，最好进队列。
    // 但是 daily-calculation 逻辑是针对单日（默认昨日）。
    // 我们可以复用 processDailyCalculation 逻辑，或者增强它。
    
    const start = dayjs(data.startDate);
    const end = dayjs(data.endDate);
    
    let current = start;
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      await this.queue.add('daily-calculation', {
        date: dateStr,
        employeeIds: data.employeeIds
      });
      current = current.add(1, 'day');
    }
    
    logger.info({ startDate: data.startDate, endDate: data.endDate }, 'Triggered manual calculation jobs');
  }

  async processDailyCalculation(data: { date?: string, employeeIds?: number[] }) {
    const dateStr = data.date || dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const targetDate = dayjs(dateStr).startOf('day').toDate();
    const nextDate = dayjs(dateStr).add(1, 'day').startOf('day').toDate();
    
    logger.info({ date: dateStr }, 'Starting daily calculation');

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
        await this.calculateEmployeeDaily(emp.id, targetDate, nextDate);
        successCount++;
      } catch (err) {
        logger.error({ employeeId: emp.id, err }, 'Failed to calculate for employee');
        failCount++;
      }
    }
    
    logger.info({ successCount, failCount, date: dateStr }, 'Daily calculation finished');
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

    const result = this.calculator.calculate(record, record.period, leaves);

    // Update Record
    await prisma.attDailyRecord.update({
      where: { id: record.id },
      data: {
        status: result.status,
        actualMinutes: result.actualMinutes,
        effectiveMinutes: result.effectiveMinutes,
        lateMinutes: result.lateMinutes,
        earlyLeaveMinutes: result.earlyLeaveMinutes,
        absentMinutes: result.absentMinutes,
        leaveMinutes: result.leaveMinutes,
        // remark: 'Auto calculated' 
      }
    });
  }
}

export const attendanceScheduler = new AttendanceScheduler();
