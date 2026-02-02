import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { 
  SupplementCheckInDto, 
  SupplementCheckOutDto, 
  QueryDailyRecordsDto, 
  DailyRecordVo,
  SupplementResultVo,
  QueryCorrectionsDto,
  CorrectionVo,
  CorrectionListVo,
  UpdateCorrectionDto,
  AttendanceStatus
} from '@attendance/shared';
import { CorrectionType, LeaveStatus, Prisma, AttCorrection } from '@prisma/client';
import { AttendanceCalculator } from './domain/attendance-calculator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export class AttendanceCorrectionService {
  private logger = createLogger('AttendanceCorrection');
  private calculator = new AttendanceCalculator();

  /**
   * 补签到
   */
  async checkIn(dto: SupplementCheckInDto, operatorId: number): Promise<SupplementResultVo> {
    this.logger.info({ dto, operatorId }, 'Starting check-in correction');
    const recordId = BigInt(dto.dailyRecordId);
    const checkInTime = dayjs(dto.checkInTime).toDate();

    return await prisma.$transaction(async (tx) => {
      // 1. 创建补签记录
      const correction = await tx.attCorrection.create({
        data: {
          employeeId: 0, // 稍后修正，需先查询 dailyRecord
          dailyRecordId: recordId,
          type: CorrectionType.check_in,
          correctionTime: checkInTime,
          operatorId,
          remark: dto.remark
        }
      });

      // 2. 重算考勤 (会自动修正 correction 的 employeeId)
      const updatedRecord = await this.recalculateDailyRecord(recordId, tx, correction.id);
      
      return {
        success: true,
        dailyRecord: this.toDailyRecordVo(updatedRecord)
      };
    });
  }

  /**
   * 补签退
   */
  async checkOut(dto: SupplementCheckOutDto, operatorId: number): Promise<SupplementResultVo> {
    const recordId = BigInt(dto.dailyRecordId);
    const checkOutTime = dayjs(dto.checkOutTime).toDate();

    return await prisma.$transaction(async (tx) => {
      // 1. 创建补签记录
      const correction = await tx.attCorrection.create({
        data: {
          employeeId: 0, // 稍后修正
          dailyRecordId: recordId,
          type: CorrectionType.check_out,
          correctionTime: checkOutTime,
          operatorId,
          remark: dto.remark
        }
      });

      // 2. 重算考勤
      const updatedRecord = await this.recalculateDailyRecord(recordId, tx, correction.id);

      return {
        success: true,
        dailyRecord: this.toDailyRecordVo(updatedRecord)
      };
    });
  }

  /**
   * 获取补签记录列表
   */
  async getCorrections(dto: QueryCorrectionsDto): Promise<CorrectionListVo> {
    const { page = 1, pageSize = 20, deptId, startDate, endDate } = dto;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: Prisma.AttCorrectionWhereInput = {};

    if (deptId) {
      where.employee = { deptId: Number(deptId) };
    }

    if (startDate && endDate) {
      where.correctionTime = {
        gte: dayjs(startDate).startOf('day').toDate(),
        lte: dayjs(endDate).endOf('day').toDate()
      };
    } else {
      // 默认最近一月
      const defaultStart = dayjs().subtract(1, 'month').startOf('day').toDate();
      where.correctionTime = { gte: defaultStart };
    }

    const [total, items] = await Promise.all([
      prisma.attCorrection.count({ where }),
      prisma.attCorrection.findMany({
        where,
        include: {
          employee: {
            include: { department: true }
          }
          // operator 关联暂无，需在 schema 添加关系或单独查询。这里假设 operatorId 对应 User 或 Employee
          // 暂时只返回 operatorId 或后续补充关联
        },
        orderBy: { correctionTime: 'desc' },
        skip,
        take: Number(pageSize)
      })
    ]);

    // 批量查询 operator name (假设 operatorId 是 User ID，这里简化处理，暂不显示 Operator Name 或假定是 Employee)
    // 根据 schema, operatorId 只是 Int。暂返回 ID 或 "System"
    
    return {
      total,
      items: items.map(item => ({
        id: item.id,
        employeeId: item.employeeId,
        employeeName: item.employee.name,
        deptName: item.employee.department?.name || '',
        type: item.type,
        correctionTime: item.correctionTime.toISOString(),
        operatorName: `User ${item.operatorId}`, // 暂位符
        updatedAt: item.updatedAt.toISOString(),
        remark: item.remark || undefined
      }))
    };
  }

  /**
   * 查询每日考勤记录
   */
  async getDailyRecords(dto: QueryDailyRecordsDto): Promise<{ total: number; items: DailyRecordVo[] }> {
    const { page = 1, pageSize = 20, deptId, startDate, endDate, status, employeeName } = dto;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: Prisma.AttDailyRecordWhereInput = {};

    if (deptId || employeeName) {
      const employeeWhere: Prisma.EmployeeWhereInput = {};
      if (deptId) employeeWhere.deptId = Number(deptId);
      if (employeeName) employeeWhere.name = { contains: employeeName };
      where.employee = employeeWhere;
    }

    if (startDate && endDate) {
      where.workDate = {
        gte: dayjs(startDate).startOf('day').toDate(),
        lte: dayjs(endDate).endOf('day').toDate()
      };
    }

    if (status) {
      where.status = status as AttendanceStatus;
    }

    const [total, items] = await Promise.all([
      prisma.attDailyRecord.count({ where }),
      prisma.attDailyRecord.findMany({
        where,
        include: {
          employee: { include: { department: true } },
          period: true,
          shift: true
        },
        orderBy: { workDate: 'desc' },
        skip,
        take: Number(pageSize)
      })
    ]);

    return {
      total,
      items: items.map(item => this.toDailyRecordVo(item))
    };
  }

  /**
   * 更新补签记录
   */
  async updateCorrection(id: number, dto: UpdateCorrectionDto, operatorId: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const correction = await tx.attCorrection.findUnique({ where: { id } });
      if (!correction) {
        throw new AppError('ERR_CORRECTION_NOT_FOUND', 'Correction not found', 404);
      }

      // 更新记录
      await tx.attCorrection.update({
        where: { id },
        data: {
          correctionTime: dayjs(dto.correctionTime).toDate(),
          remark: dto.remark,
          operatorId // 更新操作人
        }
      });

      // 触发重算
      await this.recalculateDailyRecord(correction.dailyRecordId, tx);
    });
  }

  /**
   * 删除补签记录
   */
  async deleteCorrection(id: number): Promise<void> {
    this.logger.info({ id }, 'Deleting correction');
    await prisma.$transaction(async (tx) => {
      const correction = await tx.attCorrection.findUnique({ where: { id } });
      if (!correction) {
        throw new AppError('ERR_CORRECTION_NOT_FOUND', 'Correction not found', 404);
      }

      // 物理删除
      await tx.attCorrection.delete({ where: { id } });

      // 触发重算
      await this.recalculateDailyRecord(correction.dailyRecordId, tx);
    });
  }

  // ==========================================
  // Private Helpers
  // ==========================================

  /**
   * 核心重算逻辑
   * @param dailyRecordId 每日记录ID
   * @param tx 事务客户端
   * @param currentCorrectionId 当前正在处理的补签ID (用于修正 employeeId)
   */
  private async recalculateDailyRecord(
    dailyRecordId: bigint, 
    tx: Prisma.TransactionClient,
    currentCorrectionId?: number
  ) {
    // 1. 获取每日记录及上下文
    const record = await tx.attDailyRecord.findUnique({
      where: { id: dailyRecordId },
      include: { 
        period: true,
        employee: true,
        shift: true
      }
    });

    if (!record) {
      throw new AppError('ERR_RECORD_NOT_FOUND', 'Daily record not found', 404);
    }
    if (!record.period) {
      throw new AppError('ERR_PERIOD_NOT_FOUND', 'Period not found', 500);
    }

    // 修正 currentCorrectionId 的 employeeId (如果在创建时未设置)
    if (currentCorrectionId) {
      await tx.attCorrection.update({
        where: { id: currentCorrectionId },
        data: { employeeId: record.employeeId }
      });
    }

    // 2. 获取当日所有相关数据
    const dayStart = dayjs(record.workDate).startOf('day').toDate();
    const dayEnd = dayjs(record.workDate).endOf('day').toDate();

    const [clockRecords, corrections, leaves] = await Promise.all([
      tx.attClockRecord.findMany({
        where: { 
          employeeId: record.employeeId,
          clockTime: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      }),
      tx.attCorrection.findMany({
        where: { dailyRecordId }
      }),
      tx.attLeave.findMany({
        where: { 
          employeeId: record.employeeId,
          status: LeaveStatus.approved,
          // 简单判定日期重叠，精确判定由 Calculator 处理
          startTime: { lte: dayjs(record.workDate).endOf('day').toDate() },
          endTime: { gte: dayjs(record.workDate).startOf('day').toDate() }
        }
      })
    ]);

    // 3. 确定有效打卡时间
    // 规则：优先取补签，其次取打卡
    
    // Check-In
    let checkInTime = null;
    const checkInCorrection = corrections.find(c => c.type === CorrectionType.check_in);
    if (checkInCorrection) {
      checkInTime = checkInCorrection.correctionTime;
    } else {
      // 取最早的 sign_in
      const signIns = clockRecords.filter(c => c.type === 'sign_in').sort((a, b) => a.clockTime.getTime() - b.clockTime.getTime());
      if (signIns.length > 0) {
        checkInTime = signIns[0].clockTime;
      }
    }

    // Check-Out
    let checkOutTime = null;
    const checkOutCorrection = corrections.find(c => c.type === CorrectionType.check_out);
    if (checkOutCorrection) {
      checkOutTime = checkOutCorrection.correctionTime;
    } else {
      // 取最晚的 sign_out
      const signOuts = clockRecords.filter(c => c.type === 'sign_out').sort((a, b) => b.clockTime.getTime() - a.clockTime.getTime());
      if (signOuts.length > 0) {
        checkOutTime = signOuts[0].clockTime;
      }
    }

    // 4. 调用计算器
    // 构造临时 record 对象用于计算
    const tempRecord = {
      ...record,
      checkInTime: checkInTime || null,
      checkOutTime: checkOutTime || null
    };

    const result = this.calculator.calculate(tempRecord, record.period, leaves);

    // 5. 更新数据库
    const updated = await tx.attDailyRecord.update({
      where: { id: dailyRecordId },
      data: {
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        status: result.status,
        lateMinutes: result.lateMinutes,
        earlyLeaveMinutes: result.earlyLeaveMinutes,
        absentMinutes: result.absentMinutes,
        actualMinutes: result.actualMinutes,
        effectiveMinutes: result.effectiveMinutes
      },
      include: {
        employee: { include: { department: true } },
        period: true,
        shift: true
      }
    });

    return updated;
  }

  private toDailyRecordVo(record: any): DailyRecordVo {
    return {
      id: record.id.toString(),
      employeeId: record.employeeId,
      employeeName: record.employee.name,
      deptName: record.employee.department?.name || '',
      workDate: dayjs(record.workDate).format('YYYY-MM-DD'),
      shiftName: record.shift?.name,
      startTime: record.period?.startTime,
      endTime: record.period?.endTime,
      checkInTime: record.checkInTime?.toISOString(),
      checkOutTime: record.checkOutTime?.toISOString(),
      status: record.status as AttendanceStatus,
      lateMinutes: record.lateMinutes,
      earlyLeaveMinutes: record.earlyLeaveMinutes,
      absentMinutes: record.absentMinutes
    };
  }
}
