import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { 
  SupplementCheckInDto, 
  SupplementCheckOutDto, 
  QueryDailyRecordsDto, 
  DailyRecordVo,
  SupplementResultVo 
} from '@attendance/shared/src/types/attendance/correction';
import { AttendanceStatus } from '@attendance/shared/src/types/attendance/record';
import { CorrectionType } from '@prisma/client';
import { AttendanceCalculator } from './domain/attendance-calculator';
import dayjs from 'dayjs';

export class AttendanceCorrectionService {
  private logger = createLogger('AttendanceCorrection');
  private calculator = new AttendanceCalculator();

  /**
   * 补签到
   */
  async checkIn(dto: SupplementCheckInDto, operatorId: number): Promise<SupplementResultVo> {
    const recordId = BigInt(dto.dailyRecordId);
    
    // 1. 查询原始记录
    const record = await prisma.attDailyRecord.findUnique({
      where: { id: recordId },
      include: { 
        period: true,
        employee: {
          include: { department: true }
        },
        shift: true
      }
    });

    if (!record) {
      throw new AppError('ERR_RECORD_NOT_FOUND', 'Daily record not found', 404);
    }

    if (!record.period) {
      throw new AppError('ERR_PERIOD_NOT_FOUND', 'Time period not found for this record', 400);
    }

    // 2. 更新打卡时间
    const newCheckInTime = new Date(dto.checkInTime);
    
    // 3. 重算考勤状态
    // 构造临时对象用于计算
    const tempRecord = {
      ...record,
      checkInTime: newCheckInTime
    };
    
    const calculationResult = this.calculator.calculate(tempRecord, record.period);

    // 4. 事务提交：更新记录 + 写入补签日志
    const [updatedRecord] = await prisma.$transaction([
      prisma.attDailyRecord.update({
        where: { id: recordId },
        data: {
          checkInTime: newCheckInTime,
          status: calculationResult.status as any, // Enum type matching
          lateMinutes: calculationResult.lateMinutes,
          earlyLeaveMinutes: calculationResult.earlyLeaveMinutes,
          absentMinutes: calculationResult.absentMinutes,
          // workDate doesn't change
        },
        include: {
          employee: { include: { department: true } },
          shift: true
        }
      }),
      prisma.attCorrection.create({
        data: {
          employeeId: record.employeeId,
          dailyRecordId: recordId,
          type: CorrectionType.check_in,
          correctionTime: newCheckInTime,
          operatorId: operatorId,
          remark: dto.remark
        }
      })
    ]);

    this.logger.info(`Correction CheckIn: Record ${recordId}, Employee ${record.employeeId}, Operator ${operatorId}`);

    return {
      success: true,
      dailyRecord: this.mapToVo(updatedRecord)
    };
  }

  /**
   * 补签退
   */
  async checkOut(dto: SupplementCheckOutDto, operatorId: number): Promise<SupplementResultVo> {
    const recordId = BigInt(dto.dailyRecordId);
    
    const record = await prisma.attDailyRecord.findUnique({
      where: { id: recordId },
      include: { 
        period: true,
        employee: {
          include: { department: true }
        },
        shift: true
      }
    });

    if (!record) {
      throw new AppError('ERR_RECORD_NOT_FOUND', 'Daily record not found', 404);
    }

    if (!record.period) {
      throw new AppError('ERR_PERIOD_NOT_FOUND', 'Time period not found for this record', 400);
    }

    const newCheckOutTime = new Date(dto.checkOutTime);
    
    const tempRecord = {
      ...record,
      checkOutTime: newCheckOutTime
    };
    
    const calculationResult = this.calculator.calculate(tempRecord, record.period);

    const [updatedRecord] = await prisma.$transaction([
      prisma.attDailyRecord.update({
        where: { id: recordId },
        data: {
          checkOutTime: newCheckOutTime,
          status: calculationResult.status as any,
          lateMinutes: calculationResult.lateMinutes,
          earlyLeaveMinutes: calculationResult.earlyLeaveMinutes,
          absentMinutes: calculationResult.absentMinutes,
        },
        include: {
          employee: { include: { department: true } },
          shift: true
        }
      }),
      prisma.attCorrection.create({
        data: {
          employeeId: record.employeeId,
          dailyRecordId: recordId,
          type: CorrectionType.check_out,
          correctionTime: newCheckOutTime,
          operatorId: operatorId,
          remark: dto.remark
        }
      })
    ]);

    this.logger.info(`Correction CheckOut: Record ${recordId}, Employee ${record.employeeId}, Operator ${operatorId}`);

    return {
      success: true,
      dailyRecord: this.mapToVo(updatedRecord)
    };
  }

  /**
   * 查询每日考勤记录
   */
  async getDailyRecords(query: QueryDailyRecordsDto): Promise<{ items: DailyRecordVo[]; total: number }> {
    const { page = 1, pageSize = 20, deptId, startDate, endDate, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (deptId) {
      where.employee = { deptId };
    }

    if (startDate && endDate) {
      where.workDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      where.workDate = { gte: new Date(startDate) };
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.attDailyRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { workDate: 'desc' },
        include: {
          employee: {
            include: { department: true }
          },
          shift: true,
          period: true
        }
      }),
      prisma.attDailyRecord.count({ where })
    ]);

    return {
      items: items.map(item => this.mapToVo(item)),
      total
    };
  }

  /**
   * 转换为 VO
   */
  private mapToVo(record: any): DailyRecordVo {
    return {
      id: record.id.toString(),
      employeeId: record.employeeId,
      employeeName: record.employee?.name || '',
      deptName: record.employee?.department?.name || '',
      workDate: dayjs(record.workDate).format('YYYY-MM-DD'),
      shiftName: record.shift?.name,
      startTime: record.period?.startTime,
      endTime: record.period?.endTime,
      checkInTime: record.checkInTime ? record.checkInTime.toISOString() : undefined,
      checkOutTime: record.checkOutTime ? record.checkOutTime.toISOString() : undefined,
      status: record.status as AttendanceStatus,
      lateMinutes: record.lateMinutes ?? 0,
      earlyLeaveMinutes: record.earlyLeaveMinutes ?? 0,
      absentMinutes: record.absentMinutes ?? 0
    };
  }
}
