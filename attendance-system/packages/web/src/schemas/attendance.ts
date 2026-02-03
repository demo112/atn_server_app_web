import { z } from 'zod';

// TimePeriod Rules Schema
export const TimePeriodRulesSchema = z.object({
  minWorkHours: z.number().optional(),
  maxWorkHours: z.number().optional(),
  lateGraceMinutes: z.number().optional(),
  earlyLeaveGraceMinutes: z.number().optional(),
  checkInStartOffset: z.number().optional(),
  checkInEndOffset: z.number().optional(),
  checkOutStartOffset: z.number().optional(),
  checkOutEndOffset: z.number().optional(),
  absentTime: z.number().optional(),
});

// TimePeriod Schema
export const TimePeriodSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.number(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  restStartTime: z.string().optional(),
  restEndTime: z.string().optional(),
  rules: TimePeriodRulesSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Shift Period Schema
export const ShiftPeriodSchema = z.object({
  id: z.number(),
  shiftId: z.number(),
  periodId: z.number(),
  dayOfCycle: z.number(),
  sortOrder: z.number(),
  period: TimePeriodSchema.optional(),
});

// Shift Schema
export const ShiftSchema = z.object({
  id: z.number(),
  name: z.string(),
  cycleDays: z.number(),
  periods: z.array(ShiftPeriodSchema).optional(),
});

// Schedule Schema
export const ScheduleSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  shiftId: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  // employee: EmployeeSchema.optional(), // 避免循环依赖，暂时不引入 Employee
  shift: ShiftSchema.optional(),
});

// Schedule VO Schema (extends Schedule)
export const ScheduleVoSchema = ScheduleSchema.extend({
  shiftName: z.string().optional(),
  employeeName: z.string().optional(),
});

// Leave Schemas
export const LeaveTypeSchema = z.enum(['annual', 'sick', 'personal', 'business_trip', 'maternity', 'paternity', 'marriage', 'bereavement', 'other']);
export const LeaveStatusSchema = z.enum(['pending', 'approved', 'rejected', 'cancelled']);

export const LeaveVoSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  type: LeaveTypeSchema,
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string().nullable().optional(),
  status: LeaveStatusSchema,
  approverId: z.number().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  employeeName: z.string().optional(),
  deptName: z.string().optional(),
  approverName: z.string().optional(),
});

export const PaginatedLeaveVoSchema = z.object({
  items: z.array(LeaveVoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number().optional(),
});

// Clock Record Schemas
export const ClockTypeSchema = z.enum(['sign_in', 'sign_out']);
export const ClockSourceSchema = z.enum(['app', 'web', 'device']);

export const ClockRecordSchema = z.object({
  id: z.string(),
  employeeId: z.number(),
  clockTime: z.string(),
  type: ClockTypeSchema,
  source: ClockSourceSchema,
  deviceInfo: z.record(z.unknown()).optional(),
  location: z.record(z.unknown()).optional(),
  operatorId: z.number().optional(),
  remark: z.string().optional(),
  createdAt: z.string(),
  employeeNo: z.string().optional(),
  employeeName: z.string().optional(),
  deptName: z.string().optional(),
  operatorName: z.string().optional(),
});

export const PaginatedClockRecordSchema = z.object({
  items: z.array(ClockRecordSchema),
  total: z.number(),
});

// Daily Record Schemas
export const AttendanceStatusSchema = z.enum([
  'normal',
  'late',
  'early_leave',
  'absent',
  'leave',
  'business_trip'
]);

export const DailyRecordVoSchema = z.object({
  id: z.string().or(z.number()).transform(val => String(val)), // Handle BigInt serialization
  employeeId: z.number(),
  employeeName: z.string(),
  deptName: z.string(),
  workDate: z.string(),
  shiftName: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  status: AttendanceStatusSchema,
  lateMinutes: z.number().optional(),
  earlyLeaveMinutes: z.number().optional(),
  absentMinutes: z.number().optional(),
  workMinutes: z.number().optional(),
  leaveMinutes: z.number().optional(),
  remark: z.string().optional(),
  employeeNo: z.string().optional(),
});

export const PaginatedDailyRecordVoSchema = z.object({
  items: z.array(DailyRecordVoSchema),
  total: z.number(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

// Correction Schemas
export const CorrectionTypeSchema = z.enum(['check_in', 'check_out']);

export const CorrectionVoSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  employeeName: z.string(),
  deptName: z.string(),
  type: CorrectionTypeSchema,
  correctionTime: z.string(),
  operatorName: z.string(),
  updatedAt: z.string(),
  remark: z.string().optional(),
});

export const PaginatedCorrectionVoSchema = z.object({
  items: z.array(CorrectionVoSchema),
  total: z.number(),
});

export const SupplementResultVoSchema = z.object({
  success: z.boolean(),
  dailyRecord: DailyRecordVoSchema,
});
