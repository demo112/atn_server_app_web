import { z } from 'zod';

export const AttendanceSummaryVoSchema = z.object({
  employeeId: z.number(),
  employeeNo: z.string().max(20),
  employeeName: z.string().max(50),
  deptId: z.number(),
  deptName: z.string().max(50),
  totalDays: z.number(),
  actualDays: z.number(),
  lateCount: z.number(),
  lateMinutes: z.number(),
  earlyLeaveCount: z.number(),
  earlyLeaveMinutes: z.number(),
  absentCount: z.number(),
  absentMinutes: z.number(),
  missingCount: z.number(),
  leaveCount: z.number(),
  leaveMinutes: z.number(),
  actualMinutes: z.number(),
  effectiveMinutes: z.number(),
  daily: z.array(z.string().max(50)).optional(),
});

export const DeptStatsVoSchema = z.object({
  deptId: z.number(),
  deptName: z.string().max(50),
  totalHeadcount: z.number(),
  normalCount: z.number(),
  lateCount: z.number(),
  earlyLeaveCount: z.number(),
  absentCount: z.number(),
  leaveCount: z.number(),
  attendanceRate: z.number(),
});

export const ChartStatsVoSchema = z.object({
  dailyTrend: z.array(z.object({
    date: z.string().max(50),
    attendanceRate: z.number(),
  })),
  statusDistribution: z.array(z.object({
    status: z.string().max(50),
    count: z.number(),
  })),
});