import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { AttDailyRecord, AttTimePeriod, AttendanceStatus, AttLeave } from '@prisma/client';
import { TimePeriodRules } from '@attendance/shared';

dayjs.extend(utc);

export interface CalculationResult {
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  absentMinutes: number;
  leaveMinutes: number;
  actualMinutes: number;
  effectiveMinutes: number;
  workDate: dayjs.Dayjs;
}

import { createLogger } from '../../../common/logger';

export class AttendanceCalculator {
  private logger = createLogger('AttendanceCalculator');

  /**
   * 计算单日考勤状态
   * @param record 每日记录（包含打卡时间）
   * @param period 时间段信息（包含规则）
   * @param leaves 当日请假记录（已通过）
   */
  calculate(record: AttDailyRecord, period: AttTimePeriod, leaves: AttLeave[] = []): CalculationResult {
    this.logger.debug({ recordId: record.id, workDate: record.workDate }, 'calculate: start');
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

    const shiftDuration = shiftEnd.diff(shiftStart, 'minute');

    // 2. 处理请假 (Logic B: 视为缺勤但标记为请假，不计入有效工时)
    let coveredMinutes = 0;
    let primaryLeaveType: string | null = null;
    
    // 简化处理：合并所有请假时间段
    // 实际场景应处理重叠，但这里假设输入无重叠或简单累加重叠部分（需注意重叠会导致多减）
    // 为准确起见，计算 Shift 时间段内被 Leave 覆盖的总时长
    // 简单算法：对 Shift 分钟级遍历？太慢。
    // 区间合并算法：
    // 1. 获取所有与 Shift 有交集的 Leave 区间，截断到 Shift 范围内。
    // 2. 合并这些区间。
    // 3. 计算总长度。
    
    const leaveIntervals: { start: dayjs.Dayjs, end: dayjs.Dayjs, type: string }[] = [];
    
    for (const leave of leaves) {
      const lStart = dayjs.utc(leave.startTime);
      const lEnd = dayjs.utc(leave.endTime);
      
      // 取交集
      if (lStart.isBefore(shiftEnd) && lEnd.isAfter(shiftStart)) {
        const iStart = lStart.isAfter(shiftStart) ? lStart : shiftStart;
        const iEnd = lEnd.isBefore(shiftEnd) ? lEnd : shiftEnd;
        leaveIntervals.push({ start: iStart, end: iEnd, type: leave.type });
        if (!primaryLeaveType) primaryLeaveType = leave.type;
      }
    }
    
    // 简单区间合并计算 coveredMinutes
    // 排序
    leaveIntervals.sort((a, b) => a.start.valueOf() - b.start.valueOf());
    
    let mergedCoveredMinutes = 0;
    if (leaveIntervals.length > 0) {
      let currentStart = leaveIntervals[0].start;
      let currentEnd = leaveIntervals[0].end;
      
      this.logger.debug({ count: leaveIntervals.length }, 'calculate: merging intervals start');

      for (let i = 1; i < leaveIntervals.length; i++) {
        // 防止过多次数循环
        if (i > 1000) {
          this.logger.warn('calculate: too many intervals, breaking');
          break;
        }

        const next = leaveIntervals[i];
        if (next.start.isBefore(currentEnd)) {
          // 重叠或邻接，延长 currentEnd
          if (next.end.isAfter(currentEnd)) {
            currentEnd = next.end;
          }
        } else {
          // 断开，结算上一段
          mergedCoveredMinutes += currentEnd.diff(currentStart, 'minute');
          currentStart = next.start;
          currentEnd = next.end;
        }
      }
      // 结算最后一段
      mergedCoveredMinutes += currentEnd.diff(currentStart, 'minute');
      this.logger.debug({ mergedCoveredMinutes }, 'calculate: merging intervals done');
    }
    
    coveredMinutes = mergedCoveredMinutes;

    // 如果全天覆盖 (允许 1 分钟误差)
    if (coveredMinutes >= shiftDuration - 1) {
       const status: AttendanceStatus = (primaryLeaveType === 'business_trip') ? 'business_trip' : 'leave';
       return {
         status,
         lateMinutes: 0,
         earlyLeaveMinutes: 0,
         absentMinutes: 0,
         leaveMinutes: coveredMinutes,
         actualMinutes: 0,
         effectiveMinutes: 0,
         workDate
       };
    }

    // 3. 获取打卡时间 (UTC)
    const checkIn = record.checkInTime ? dayjs.utc(record.checkInTime) : null;
    const checkOut = record.checkOutTime ? dayjs.utc(record.checkOutTime) : null;

    // 初始化结果
    let status: AttendanceStatus = 'normal';
    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    let absentMinutes = 0;
    let actualMinutes = 0;
    
    // 4. 计算实际工时
    if (checkIn && checkOut) {
      actualMinutes = Math.max(0, checkOut.diff(checkIn, 'minute'));
    }

    // 5. 判定缺勤
    if (!checkIn && !checkOut) {
      status = 'absent';
      // 缺勤时长 = 班次时长 - 请假覆盖时长
      absentMinutes = Math.max(0, shiftDuration - coveredMinutes);
      return { status, lateMinutes, earlyLeaveMinutes, absentMinutes, leaveMinutes: coveredMinutes, actualMinutes, effectiveMinutes: 0, workDate };
    }

    if (!checkIn || !checkOut) {
      status = 'absent'; 
      // 缺卡暂时无法精确计算迟到早退，记为缺勤
      // 也可以扣除请假部分，但缺卡本身就是异常
      absentMinutes = Math.max(0, shiftDuration - coveredMinutes); 
      return { status, lateMinutes, earlyLeaveMinutes, absentMinutes, leaveMinutes: coveredMinutes, actualMinutes, effectiveMinutes: 0, workDate };
    }

    // 6. 计算迟到 (扣除请假)
    const lateGrace = rules.lateGraceMinutes || 0;
    // 原始迟到时长
    let rawLate = 0;
    if (checkIn.isAfter(shiftStart)) {
      rawLate = checkIn.diff(shiftStart, 'minute');
    }
    
    if (rawLate > 0) {
      // 计算迟到时间段 [ShiftStart, CheckIn] 被请假覆盖的时长
      const latePeriodEnd = checkIn;
      let coveredLate = 0;
      
      // 复用区间逻辑 (针对 latePeriod)
      // 这里为简单起见，重新遍历 intervals
      // 更好的做法是封装区间计算函数，但这里直接写
      for (const interval of leaveIntervals) {
        // 交集 [ShiftStart, CheckIn] AND Interval
        if (interval.start.isBefore(latePeriodEnd) && interval.end.isAfter(shiftStart)) {
          const iStart = interval.start.isAfter(shiftStart) ? interval.start : shiftStart;
          const iEnd = interval.end.isBefore(latePeriodEnd) ? interval.end : latePeriodEnd;
          coveredLate += iEnd.diff(iStart, 'minute');
        }
      }
      
      // 扣除请假覆盖的时长（确保不为负数）
      const finalLate = Math.max(0, rawLate - coveredLate);
      
      if (finalLate > lateGrace) {
        lateMinutes = finalLate;
        status = 'late';
      }
    }

    // 7. 计算早退 (扣除请假)
    const earlyGrace = rules.earlyLeaveGraceMinutes || 0;
    let rawEarly = 0;
    if (checkOut.isBefore(shiftEnd)) {
      rawEarly = shiftEnd.diff(checkOut, 'minute');
    }
    
    if (rawEarly > 0) {
       // 计算早退时间段 [CheckOut, ShiftEnd] 被请假覆盖的时长
       const earlyPeriodStart = checkOut;
       let coveredEarly = 0;
       
       for (const interval of leaveIntervals) {
         if (interval.start.isBefore(shiftEnd) && interval.end.isAfter(earlyPeriodStart)) {
            const iStart = interval.start.isAfter(earlyPeriodStart) ? interval.start : earlyPeriodStart;
            const iEnd = interval.end.isBefore(shiftEnd) ? interval.end : shiftEnd;
            coveredEarly += iEnd.diff(iStart, 'minute');
         }
       }
       
       const finalEarly = Math.max(0, rawEarly - coveredEarly);
       if (finalEarly > earlyGrace) {
         earlyLeaveMinutes = finalEarly;
         // 如果已经是迟到
         if (status === 'normal') {
           status = 'early_leave';
         }
         // 如果既迟到又早退，Status保持Late (或根据业务优先级)
       }
    }

    // 8. 判定严重迟到/旷工
    const absentThreshold = rules.absentTime || 0;
    if (absentThreshold > 0 && lateMinutes > absentThreshold) {
      status = 'absent';
      absentMinutes = lateMinutes; 
    }

    return {
      status,
      lateMinutes,
      earlyLeaveMinutes,
      absentMinutes,
      leaveMinutes: coveredMinutes,
      actualMinutes,
      effectiveMinutes: actualMinutes, // Logic B: 请假不计入有效工时
      workDate
    };
  }

  private combineDateAndTime(date: dayjs.Dayjs, timeStr: string): dayjs.Dayjs {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return date.hour(hours).minute(minutes).second(0).millisecond(0);
  }
}
