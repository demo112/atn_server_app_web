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
// 用户/组织模块类型 (sasuke 负责)
// ============================================

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  username: string;
  employeeId?: number;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: number;
  employeeNo: string;
  name: string;
  phone?: string;
  email?: string;
  deptId?: number;
  deptName?: string; // 冗余字段，方便显示
  status: EmployeeStatus;
  hireDate?: string;
  leaveDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  parentId?: number;
  sortOrder: number;
  children?: Department[];
  employeeCount?: number; // 部门人数（含子部门）
}

// ============================================
// 考勤配置模块类型 (naruto 负责)
// ============================================

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
  dayOfCycle: number;  // 1-7
  sortOrder: number;
  period?: TimePeriod;
}

export interface Schedule {
  id: number;
  employeeId: number;
  shiftId: number;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  employee?: Employee;
  shift?: Shift;
}

// ============================================
// 考勤数据模块类型 (naruto 负责)
// ============================================

export type ClockType = 'sign_in' | 'sign_out';
export type ClockSource = 'app' | 'web' | 'device';

export interface ClockRecord {
  id: string;
  employeeId: number;
  clockTime: string;  // ISO datetime
  type: ClockType;
  source: ClockSource;
  deviceInfo?: any;
  location?: any;
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

export interface CreateScheduleDto {
  employeeId: number;
  shiftId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  force?: boolean;
}

export interface BatchCreateScheduleDto {
  departmentIds: number[];
  shiftId: number;
  startDate: string;
  endDate: string;
  force?: boolean;
  includeSubDepartments?: boolean;
}

export interface ScheduleVo extends Schedule {
  shiftName?: string;
  employeeName?: string;
}

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

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Leave {
  id: number;
  employeeId: number;
  type: LeaveType;
  startTime: string;
  endTime: string;
  reason?: string;
  status: LeaveStatus;
  approverId?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  // 冗余字段
  employeeNo?: string;
  employeeName?: string;
  deptName?: string;
  approverName?: string;
}

// ============================================
// 统计报表类型 (sasuke 负责)
// ============================================

export interface AttendanceSummary {
  employeeId: number;
  employeeNo: string;
  employeeName: string;
  deptId: number;
  deptName: string;
  totalDays: number;         // 应出勤天数
  actualDays: number;        // 实际出勤天数
  lateCount: number;         // 迟到次数
  lateMinutes: number;       // 迟到总分钟
  earlyLeaveCount: number;   // 早退次数
  earlyLeaveMinutes: number; // 早退总分钟
  absentCount: number;       // 缺勤次数
  absentMinutes: number;     // 缺勤总分钟
  leaveCount: number;        // 请假次数
  leaveMinutes: number;      // 请假总分钟
  actualMinutes: number;     // 实际出勤总分钟
  effectiveMinutes: number;  // 有效出勤总分钟
}

// ============================================
// 查询参数类型
// ============================================

export interface ClockRecordQuery extends QueryParams {
  startTime?: string;
  endTime?: string;
  deptId?: number;
  employeeId?: number;
  type?: ClockType;
  source?: ClockSource;
}

export interface DailyRecordQuery extends QueryParams {
  startDate?: string;
  endDate?: string;
  deptId?: number;
  employeeId?: number;
  status?: AttendanceStatus;
}

export interface LeaveQuery extends QueryParams {
  startTime?: string;
  endTime?: string;
  deptId?: number;
  employeeId?: number;
  type?: LeaveType;
  status?: LeaveStatus;
}

export interface SummaryQuery {
  startDate: string;
  endDate: string;
  deptId?: number;
  employeeId?: number;
}
