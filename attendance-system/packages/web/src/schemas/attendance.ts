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
