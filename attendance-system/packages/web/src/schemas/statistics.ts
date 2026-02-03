import { z } from 'zod';

export const AttendanceSummaryVoSchema = z.object({
  employeeId: z.number(),
  employeeNo: z.string(),
  employeeName: z.string(),
  deptId: z.number(),
  deptName: z.string(),
  totalDays: z.number(),
  actualDays: z.number(),
  lateCount: z.number(),
  lateMinutes: z.number(),
  earlyLeaveCount: z.number(),
  earlyLeaveMinutes: z.number(),
  absentCount: z.number(),
  absentMinutes: z.number(),
  leaveCount: z.number(),
  leaveMinutes: z.number(),
  actualMinutes: z.number(),
  effectiveMinutes: z.number(),
});

export const DeptStatsVoSchema = z.object({
  deptId: z.number(),
  deptName: z.string(),
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
    date: z.string(),
    attendanceRate: z.number(),
  })),
  statusDistribution: z.array(z.object({
    status: z.string(),
    count: z.number(),
  })),
});
