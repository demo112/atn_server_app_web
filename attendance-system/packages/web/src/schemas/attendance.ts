import { z } from 'zod';
import { 
  LeaveType, 
  LeaveStatus
} from '@attendance/shared';

// TimePeriod Rules Schema
export const TimePeriodRulesSchema = z.object({
  minWorkHours: z.number().min(0).nullable().optional(),
  maxWorkHours: z.number().min(0).nullable().optional(),
  lateGraceMinutes: z.number().min(0).nullable().optional(),
  earlyLeaveGraceMinutes: z.number().min(0).nullable().optional(),
  checkInStartOffset: z.number().nullable().optional(),
  checkInEndOffset: z.number().nullable().optional(),
  checkOutStartOffset: z.number().nullable().optional(),
  checkOutEndOffset: z.number().nullable().optional(),
  absentTime: z.number().min(0).nullable().optional(),
});

// TimePeriod Schema
export const TimePeriodSchema = z.object({
  id: z.coerce.number(),
  name: z.string().max(50),
  type: z.number(),
  startTime: z.string().max(50).nullable().optional().transform((v): string | undefined => v ?? undefined),
  endTime: z.string().max(50).nullable().optional().transform((v): string | undefined => v ?? undefined),
  restStartTime: z.string().max(50).nullable().optional().transform((v): string | undefined => v ?? undefined),
  restEndTime: z.string().max(50).nullable().optional().transform((v): string | undefined => v ?? undefined),
  rules: TimePeriodRulesSchema.nullable().optional(),
  createdAt: z.string().max(50),
  updatedAt: z.string().max(50).optional(),
});

// Shift Period Schema
export const ShiftPeriodSchema = z.object({
  id: z.coerce.number(),
  shiftId: z.coerce.number(),
  periodId: z.coerce.number(),
  dayOfCycle: z.number(),
  sortOrder: z.number(),
  period: TimePeriodSchema.optional(),
});

// Shift Day Schema
export const ShiftDaySchema = z.object({
  dayOfCycle: z.number(),
  periods: z.array(TimePeriodSchema),
});

// Shift Schema
export const ShiftSchema = z.object({
  id: z.coerce.number(),
  name: z.string().max(50),
  cycleDays: z.number(),
  periods: z.array(ShiftPeriodSchema).optional(),
  days: z.array(ShiftDaySchema).optional(),
  createdAt: z.string().max(50).optional(),
  updatedAt: z.string().max(50).optional(),
});

// Schedule Schema
export const ScheduleSchema = z.object({
  id: z.coerce.number(),
  employeeId: z.number(),
  shiftId: z.number(),
  startDate: z.string().max(50),
  endDate: z.string().max(50),
  // employee: EmployeeSchema.optional(), // 避免循环依赖，暂时不引入 Employee
  shift: ShiftSchema.optional(),
});

// Schedule VO Schema (extends Schedule)
export const ScheduleVoSchema = ScheduleSchema.extend({
  shiftName: z.string().max(50).optional(),
  employeeName: z.string().max(50).optional(),
});

// Leave Schemas
export const LeaveTypeSchema = z.nativeEnum(LeaveType);
export const LeaveStatusSchema = z.nativeEnum(LeaveStatus);

export const LeaveVoSchema = z.object({
  id: z.coerce.number(),
  employeeId: z.coerce.number(),
  type: LeaveTypeSchema,
  startTime: z.string().max(50),
  endTime: z.string().max(50),
  reason: z.string().max(200).nullable().optional(),
  status: LeaveStatusSchema,
  approverId: z.coerce.number().nullable().optional(),
  approvedAt: z.string().max(50).nullable().optional(),
  createdAt: z.string().max(50),
  updatedAt: z.string().max(50),
  employeeName: z.string().max(100).optional(),
  deptName: z.string().max(100).optional(),
  approverName: z.string().max(100).optional(),
});

export const PaginatedLeaveVoSchema = z.object({
  items: z.array(LeaveVoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// Clock Record Schemas
export const ClockTypeSchema = z.enum(['sign_in', 'sign_out']);
export const ClockSourceSchema = z.enum(['app', 'web', 'device']);

export const ClockRecordSchema = z.object({
  id: z.coerce.string(),
  employeeId: z.coerce.number(),
  clockTime: z.string().max(50),
  type: ClockTypeSchema,
  source: ClockSourceSchema,
  deviceInfo: z.record(z.string().max(50), z.unknown()).nullable().optional().transform(v => v ?? undefined),
  location: z.record(z.string().max(50), z.unknown()).nullable().optional().transform(v => v ?? undefined),
  operatorId: z.coerce.number().nullable().optional().transform(v => v ?? undefined),
  remark: z.string().max(200).nullable().optional().transform(v => v ?? undefined),
  createdAt: z.string().max(50),
  employeeNo: z.string().max(50).nullable().optional().transform(v => v ?? undefined),
  employeeName: z.string().max(100).nullable().optional().transform(v => v ?? undefined),
  deptName: z.string().max(100).nullable().optional().transform(v => v ?? undefined),
  operatorName: z.string().max(100).nullable().optional().transform(v => v ?? undefined),
});

export const PaginatedClockRecordSchema = z.object({
  items: z.array(ClockRecordSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
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
  id: z.coerce.string(), // Handle BigInt serialization
  employeeId: z.coerce.number(),
  employeeName: z.string().max(100),
  deptName: z.string().max(100),
  workDate: z.string().max(50),
  shiftName: z.string().max(50).nullable().optional().transform(v => v ?? undefined),
  startTime: z.string().max(50).nullable().optional().transform(v => v ?? undefined),
  endTime: z.string().max(50).nullable().optional().transform(v => v ?? undefined),
  checkInTime: z.string().max(50).nullable().optional().transform(v => v ?? undefined),
  checkOutTime: z.string().max(50).nullable().optional().transform(v => v ?? undefined),
  status: AttendanceStatusSchema,
  lateMinutes: z.number(),
  earlyLeaveMinutes: z.number(),
  absentMinutes: z.number(),
  leaveMinutes: z.number(),
  workMinutes: z.number().nullable().optional().transform(v => v ?? undefined),
  remark: z.string().max(200).nullable().optional().transform(v => v ?? undefined),
  employeeNo: z.string().max(50).nullable().optional().transform(v => v ?? undefined),
});

export const PaginatedDailyRecordVoSchema = z.object({
  items: z.array(DailyRecordVoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// Correction Schemas
export const CorrectionTypeSchema = z.enum(['check_in', 'check_out']);

export const CorrectionVoSchema = z.object({
  id: z.coerce.number(),
  employeeId: z.coerce.number(),
  employeeName: z.string().max(100),
  deptName: z.string().max(100),
  type: CorrectionTypeSchema,
  correctionTime: z.string().max(50),
  operatorName: z.string().max(100),
  updatedAt: z.string().max(50),
  remark: z.string().max(200).optional(),
});

export const PaginatedCorrectionVoSchema = z.object({
  items: z.array(CorrectionVoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export const SupplementResultVoSchema = z.object({
  success: z.boolean(),
  dailyRecord: DailyRecordVoSchema,
});

// Settings Schema
export const AttendanceSettingsSchema = z.object({
  day_switch_time: z.string().max(50),
  auto_calc_time: z.string().max(50).optional(),
}).passthrough(); // Allow other keys as per interface [key: string]: any