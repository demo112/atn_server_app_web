// @attendance/shared - 共享类型定义
// 所有端共用的类型，严禁依赖其他业务模块

// ============================================
// 通用类型
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// 用户/组织模块类型 (人A负责)
// ============================================

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  employeeNo: string;
  name: string;
  phone?: string;
  email?: string;
  deptId?: number;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  parentId?: number;
  sortOrder: number;
  children?: Department[];
}

export type DeviceType = 'face' | 'fingerprint' | 'card';
export type DeviceStatus = 'online' | 'offline' | 'disabled';

export interface Device {
  id: number;
  name: string;
  sn: string;
  type: DeviceType;
  location?: string;
  supportsTemperature: boolean;
  supportsMask: boolean;
  status: DeviceStatus;
}

// ============================================
// 考勤模块类型 (人B负责)
// ============================================

export type TimePeriodType = 'normal' | 'flexible';
export type FlexCalcMethod = 'first_last' | 'pair';

export interface TimePeriod {
  id: number;
  name: string;
  type: TimePeriodType;
  workStart?: string;
  workEnd?: string;
  checkInStart?: string;
  checkInEnd?: string;
  checkOutStart?: string;
  checkOutEnd?: string;
  requireCheckIn: boolean;
  requireCheckOut: boolean;
  lateRule?: Record<string, unknown>;
  earlyLeaveRule?: Record<string, unknown>;
  absentCheckInRule?: Record<string, unknown>;
  absentCheckOutRule?: Record<string, unknown>;
  flexCalcMethod?: FlexCalcMethod;
  flexMinInterval?: number;
  flexDailyHours?: number;
  flexDaySwitch?: string;
}

export interface Shift {
  id: number;
  name: string;
  cycleDays: number;
  periods?: ShiftPeriod[];
}

export interface ShiftPeriod {
  id: number;
  shiftId: number;
  periodId: number;
  dayOfCycle: number;
  sortOrder: number;
  period?: TimePeriod;
}

export interface Schedule {
  id: number;
  userId: number;
  shiftId: number;
  startDate: string;
  endDate: string;
  user?: User;
  shift?: Shift;
}

export type MaskStatus = 'none' | 'wearing' | 'not_wearing';

export interface ClockRecord {
  id: number;
  userId: number;
  deviceId?: number;
  clockTime: string;
  temperature?: number;
  maskStatus?: MaskStatus;
  user?: User;
  device?: Device;
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
  userId: number;
  workDate: string;
  shiftId?: number;
  periodId?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  actualHours?: number;
  effectiveHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  absentMinutes?: number;
  remark?: string;
  user?: User;
  shift?: Shift;
  period?: TimePeriod;
}

export type CorrectionType = 'check_in' | 'check_out';

export interface Correction {
  id: number;
  userId: number;
  dailyRecordId: number;
  type: CorrectionType;
  correctionTime: string;
  operatorId: number;
  createdAt: string;
}

export type LeaveType = 
  | 'annual' 
  | 'sick' 
  | 'personal' 
  | 'business_trip' 
  | 'maternity' 
  | 'paternity' 
  | 'marriage' 
  | 'bereavement' 
  | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Leave {
  id: number;
  userId: number;
  type: LeaveType;
  startTime: string;
  endTime: string;
  reason?: string;
  applyTime: string;
  status: LeaveStatus;
}

// ============================================
// 统计报表类型
// ============================================

export interface AttendanceSummary {
  userId: number;
  employeeNo: string;
  name: string;
  deptName: string;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  actualHours: number;
  effectiveHours: number;
  absentMinutes: number;
  leaveHours: number;
}

export interface ClockRecordQuery extends QueryParams {
  startTime?: string;
  endTime?: string;
  deptId?: number;
  userId?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  maskStatus?: MaskStatus;
}

export interface DailyRecordQuery extends QueryParams {
  startDate?: string;
  endDate?: string;
  deptId?: number;
  userId?: number;
  status?: AttendanceStatus;
}
