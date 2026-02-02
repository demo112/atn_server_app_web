// ============================================
// 考勤基础配置类型 (TimePeriod, Shift)
// ============================================

export interface TimePeriodRules {
  // 弹性规则
  minWorkHours?: number; // 最小工时（分钟）
  maxWorkHours?: number;
  
  // 宽限规则
  lateGraceMinutes?: number; // 迟到宽限
  earlyLeaveGraceMinutes?: number; // 早退宽限
  
  // 打卡窗口
  checkInStartOffset?: number; // 上班前多久可打卡
  checkInEndOffset?: number; // 上班后多久可打卡
  checkOutStartOffset?: number;
  checkOutEndOffset?: number;
  
  // 旷工规则
  absentTime?: number; // 迟到超过多少分钟算旷工
}

export interface TimePeriod {
  id: number;
  name: string;
  type: number; // 0:固定, 1:弹性
  startTime?: string;
  endTime?: string;
  restStartTime?: string;
  restEndTime?: string;
  rules?: TimePeriodRules;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimePeriodDto {
  name: string;
  type: number;
  startTime?: string;
  endTime?: string;
  restStartTime?: string;
  restEndTime?: string;
  rules?: TimePeriodRules;
}

export interface UpdateTimePeriodDto extends Partial<CreateTimePeriodDto> {}

// 异常规则类型
export interface LateRule {
  graceMinutes?: number;     // 宽限分钟数
  deductMinutes?: number;    // 每迟到N分钟扣除
}

export interface EarlyLeaveRule {
  graceMinutes?: number;
  deductMinutes?: number;
}

export interface AbsentRule {
  markAsAbsent?: boolean;    // 是否标记为缺勤
  absentMinutes?: number;    // 缺勤分钟数
}

export interface ShiftPeriod {
  id: number;
  shiftId: number;
  periodId: number;
  dayOfCycle: number;  // 1-7
  sortOrder: number;
  period?: TimePeriod;
}

export interface Shift {
  id: number;
  name: string;
  cycleDays: number;
  periods?: ShiftPeriod[];
}

export interface CreateShiftDto {
  name: string;
  cycleDays: number;
  periods: {
    periodId: number;
    dayOfCycle: number;
    sortOrder?: number;
  }[];
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {}
