import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AttDailyRecord, AttTimePeriod, AttendanceStatus } from '@prisma/client';
import { TimePeriodRules } from '@attendance/shared';

dayjs.extend(utc);

export interface CalculationResult {
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  absentMinutes: number;
  actualMinutes: number;
  effectiveMinutes: number;
  workDate: dayjs.Dayjs;
}

export class AttendanceCalculator {
  /**
   * 计算单日考勤状态
   * @param record 每日记录（包含打卡时间）
   * @param period 时间段信息（包含规则）
   */
  calculate(record: AttDailyRecord, period: AttTimePeriod): CalculationResult {
    const rules = (period.rules as unknown as TimePeriodRules) || {};
    // Use UTC to ensure consistent calculation regardless of server timezone
    const workDate = dayjs.utc(record.workDate);
    
    // 1. 解析班次时间
    const startTimeStr = period.startTime || '09:00';
    const endTimeStr = period.endTime || '18:00';
    
    const shiftStart = this.combineDateAndTime(workDate, startTimeStr);
    let shiftEnd = this.combineDateAndTime(workDate, endTimeStr);
    
    // 处理跨天 (如果结束时间小于开始时间，说明跨天)
    if (shiftEnd.isBefore(shiftStart)) {
      shiftEnd = shiftEnd.add(1, 'day');
    }

    // 2. 获取打卡时间 (UTC)
    const checkIn = record.checkInTime ? dayjs.utc(record.checkInTime) : null;
    const checkOut = record.checkOutTime ? dayjs.utc(record.checkOutTime) : null;

    // 初始化结果
    let status: AttendanceStatus = 'normal';
    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let absentMinutes = 0;
    let actualMinutes = 0;
    
    // 3. 计算实际工时
    if (checkIn && checkOut) {
      actualMinutes = checkOut.diff(checkIn, 'minute');
    }

    // 4. 判定缺勤 (如果没有打卡，或者迟到时间超过旷工阈值)
    // 情况A: 完全未打卡 -> 缺勤
    if (!checkIn && !checkOut) {
      status = 'absent';
      // 缺勤时长通常记为标准工时
      absentMinutes = shiftEnd.diff(shiftStart, 'minute');
      return { status, lateMinutes, earlyLeaveMinutes, absentMinutes, actualMinutes, effectiveMinutes: 0, workDate };
    }

    // 情况B: 缺卡 (只有签到或只有签退) -> 视为异常/缺勤? 
    // 通常缺卡需要补签，暂时标记为 absent 或其他状态，这里简化处理：
    // 如果缺任何一卡，暂时视为 absent (需补签)
    if (!checkIn || !checkOut) {
      status = 'absent'; 
      // 可以在这里细化，但根据需求 "queryDailyRecords" 会查出异常记录
      // 如果只打了一次卡，无法计算迟到/早退的完整逻辑，建议先标记为异常(absent或特定的异常状态)
      // Prisma Enum 有 'absent', 'late', 'early_leave', 'normal', 'leave'
      // 暂定: 缺卡 = absent
      return { status, lateMinutes, earlyLeaveMinutes, absentMinutes, actualMinutes, effectiveMinutes: 0, workDate };
    }

    // 5. 计算迟到
    // 迟到判定：签到时间 > 上班时间 + 宽限
    const lateGrace = rules.lateGraceMinutes || 0;
    if (checkIn.isAfter(shiftStart.add(lateGrace, 'minute'))) {
      lateMinutes = checkIn.diff(shiftStart, 'minute');
      status = 'late';
    }

    // 6. 计算早退
    // 早退判定：签退时间 < 下班时间 - 宽限
    const earlyGrace = rules.earlyLeaveGraceMinutes || 0;
    if (checkOut.isBefore(shiftEnd.subtract(earlyGrace, 'minute'))) {
      earlyLeaveMinutes = shiftEnd.diff(checkOut, 'minute');
      // 如果已经是迟到，状态如何处理？通常是 "迟到且早退"，但Status是单值。
      // 优先级：Absent > Late > EarlyLeave ? 或者根据业务。
      // 这里如果已经是 Late，保持 Late? 或者有复合状态?
      // 简单起见，如果既迟到又早退，且没有"LateAndEarly"状态，优先显示迟到? 或者早退?
      // 通常迟到更常见。或者看谁的时间更长。
      // 暂时逻辑: 如果已经是 Late，则保持 Late (但在 UI 上可能显示两个指标)
      // 为了都能体现，Status 字段可能只能存一个主要状态，但 lateMinutes 和 earlyMinutes 都会记录。
      if (status === 'normal') {
        status = 'early_leave';
      }
    }

    // 7. 判定严重迟到/旷工
    const absentThreshold = rules.absentTime || 0;
    if (absentThreshold > 0 && lateMinutes > absentThreshold) {
      status = 'absent';
      absentMinutes = lateMinutes; // 或者记录为标准工时? 视规则而定
    }

    return {
      status,
      lateMinutes,
      earlyLeaveMinutes,
      absentMinutes,
      actualMinutes,
      effectiveMinutes: actualMinutes, // 简单起见，有效工时 = 实际工时 (扣除休息时间逻辑暂略)
      workDate
    };
  }

  private combineDateAndTime(date: dayjs.Dayjs, timeStr: string): dayjs.Dayjs {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return date.hour(hours).minute(minutes).second(0).millisecond(0);
  }
}
