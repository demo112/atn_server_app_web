import { QueryParams } from '../common';

// ============================================
// 考勤数据/记录类型
// ============================================

export type ClockType = 'sign_in' | 'sign_out';
export type ClockSource = 'app' | 'web' | 'device';

export interface DeviceInfo {
  deviceId?: string;
  model?: string;
  os?: string;
  version?: string;
  [key: string]: unknown;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
  [key: string]: unknown;
}

export interface ClockRecord {
  id: string;
  employeeId: number;
  clockTime: string;  // ISO datetime
  type: ClockType;
  source: ClockSource;
  deviceInfo?: DeviceInfo;
  location?: LocationInfo;
  operatorId?: number;
  remark?: string;
  createdAt: string;
  // 冗余字段
  employeeNo?: string;
  employeeName?: string;
  deptName?: string;
  operatorName?: string;
}

export type AttendanceStatus =
  | 'normal'
  | 'late'
  | 'early_leave'
  | 'absent'
  | 'leave'
  | 'business_trip';

export interface DailyRecord {
  id: number;
  employeeId: number;
  workDate: string;  // YYYY-MM-DD
  shiftId?: number;
  periodId?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  actualMinutes?: number;
  effectiveMinutes?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  absentMinutes?: number;
  remark?: string;
  // 冗余字段
  employeeNo?: string;
  employeeName?: string;
  deptId?: number;
  deptName?: string;
  shiftName?: string;
  periodName?: string;
}

export type CorrectionType = 'check_in' | 'check_out';

export interface Correction {
  id: number;
  employeeId: number;
  dailyRecordId: number;
  type: CorrectionType;
  correctionTime: string;
  operatorId: number;
  remark?: string;
  createdAt: string;
  // 冗余字段
  employeeNo?: string;
  employeeName?: string;
  deptName?: string;
  operatorName?: string;
}

// Queries
export interface ClockRecordQuery extends QueryParams {
  startTime?: string;
  endTime?: string;
  deptId?: number;
  employeeId?: number;
  type?: ClockType;
  source?: ClockSource;
}

export interface CreateClockDto {
  employeeId: number;
  clockTime: string;
  type: ClockType;
  source: ClockSource;
  deviceInfo?: DeviceInfo;
  location?: LocationInfo;
  remark?: string;
}

export interface DailyRecordQuery extends QueryParams {
  startDate?: string;
  endDate?: string;
  deptId?: number;
  employeeId?: number;
  employeeName?: string;
  status?: AttendanceStatus;
}

export interface DailyRecordVo {
  id: string; // BigInt -> String
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  deptName: string;
  workDate: string;
  shiftName?: string;
  startTime?: string; // 班次开始时间 HH:mm
  endTime?: string;   // 班次结束时间 HH:mm
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  absentMinutes: number;
  leaveMinutes: number;
}

export interface CalendarDailyVo {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  isAbnormal: boolean;
}

