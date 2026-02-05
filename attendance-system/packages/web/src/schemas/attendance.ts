import { z } from 'zod';
import { 
  LeaveType, 
  LeaveStatus
} from '@attendance/shared';

// TimePeriod Rules Schema
export const TimePeriodRulesSchema = z.object({
  minWorkHours: z.number().min(0).optional(),
  maxWorkHours: z.number().min(0).optional(),
  lateGraceMinutes: z.number().min(0).optional(),
  earlyLeaveGraceMinutes: z.number().min(0).optional(),
  checkInStartOffset: z.number().min(0).optional(),
  checkInEndOffset: z.number().min(0).optional(),
  checkOutStartOffset: z.number().min(0).optional(),
  checkOutEndOffset: z.number().min(0).optional(),
  absentTime: z.number().min(0).optional(),
});

// TimePeriod Schema
export const TimePeriodSchema = z.object({
  id: z.coerce.number(),
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
  id: z.coerce.number(),
  shiftId: z.coerce.number(),
  periodId: z.coerce.number(),
  dayOfCycle: z.number(),
  sortOrder: z.number(),
  period: TimePeriodSchema.optional(),
});

// Shift Schema
export const ShiftSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  cycleDays: z.number(),
  periods: z.array(ShiftPeriodSchema).optional(),
});

// Schedule Schema
export const ScheduleSchema = z.object({
  id: z.coerce.number(),
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
export const LeaveTypeSchema = z.nativeEnum(LeaveType);
export const LeaveStatusSchema = z.nativeEnum(LeaveStatus);

export const LeaveVoSchema = z.object({
  id: z.coerce.number(),
  employeeId: z.coerce.number(),
  type: LeaveTypeSchema,
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string().nullable().optional(),
  status: LeaveStatusSchema,
  approverId: z.coerce.number().nullable().optional(),
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
  totalPages: z.number(),
});

// Clock Record Schemas
export const ClockTypeSchema = z.enum(['sign_in', 'sign_out']);
export const ClockSourceSchema = z.enum(['app', 'web', 'device']);

export const ClockRecordSchema = z.object({
  id: z.coerce.string(),
  employeeId: z.coerce.number(),
  clockTime: z.string(),
  type: ClockTypeSchema,
  source: ClockSourceSchema,
  deviceInfo: z.record(z.string(), z.unknown()).nullable().optional().transform(v => v ?? undefined),
  location: z.record(z.string(), z.unknown()).nullable().optional().transform(v => v ?? undefined),
  operatorId: z.coerce.number().nullable().optional().transform(v => v ?? undefined),
  remark: z.string().nullable().optional().transform(v => v ?? undefined),
  createdAt: z.string(),
  employeeNo: z.string().nullable().optional().transform(v => v ?? undefined),
  employeeName: z.string().nullable().optional().transform(v => v ?? undefined),
  deptName: z.string().nullable().optional().transform(v => v ?? undefined),
  operatorName: z.string().nullable().optional().transform(v => v ?? undefined),
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
  employeeName: z.string(),
  deptName: z.string(),
  workDate: z.string(),
  shiftName: z.string().nullable().optional().transform(v => v ?? undefined),
  startTime: z.string().nullable().optional().transform(v => v ?? undefined),
  endTime: z.string().nullable().optional().transform(v => v ?? undefined),
  checkInTime: z.string().nullable().optional().transform(v => v ?? undefined),
  checkOutTime: z.string().nullable().optional().transform(v => v ?? undefined),
  status: AttendanceStatusSchema,
  lateMinutes: z.number(),
  earlyLeaveMinutes: z.number(),
  absentMinutes: z.number(),
  leaveMinutes: z.number(),
  workMinutes: z.number().nullable().optional().transform(v => v ?? undefined),
  remark: z.string().nullable().optional().transform(v => v ?? undefined),
  employeeNo: z.string().nullish().transform(v => v ?? ''),
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
  day_switch_time: z.string(),
  auto_calc_time: z.string().optional(),
}).passthrough(); // Allow other keys as per interface [key: string]: any
