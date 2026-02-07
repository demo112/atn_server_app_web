# Web Zod Schema Gap Analysis Report
Generated at: 2026-02-07T02:54:08.333Z

## Summary
Total Potential Gaps Found: 107

## Details
The following locations use `z.string()` without an explicit `.max()` constraint on the same line.

| File | Line | Content |
|------|------|---------|
| schemas\attendance.ts | 23 | `name: z.string(),` |
| schemas\attendance.ts | 25 | `startTime: z.string().nullable().optional().transform((v): string | undefined => v ?? undefined),` |
| schemas\attendance.ts | 26 | `endTime: z.string().nullable().optional().transform((v): string | undefined => v ?? undefined),` |
| schemas\attendance.ts | 27 | `restStartTime: z.string().nullable().optional().transform((v): string | undefined => v ?? undefined),` |
| schemas\attendance.ts | 28 | `restEndTime: z.string().nullable().optional().transform((v): string | undefined => v ?? undefined),` |
| schemas\attendance.ts | 30 | `createdAt: z.string(),` |
| schemas\attendance.ts | 31 | `updatedAt: z.string().optional(),` |
| schemas\attendance.ts | 53 | `name: z.string(),` |
| schemas\attendance.ts | 57 | `createdAt: z.string().optional(),` |
| schemas\attendance.ts | 58 | `updatedAt: z.string().optional(),` |
| schemas\attendance.ts | 66 | `startDate: z.string(),` |
| schemas\attendance.ts | 67 | `endDate: z.string(),` |
| schemas\attendance.ts | 74 | `shiftName: z.string().optional(),` |
| schemas\attendance.ts | 75 | `employeeName: z.string().optional(),` |
| schemas\attendance.ts | 86 | `startTime: z.string(),` |
| schemas\attendance.ts | 87 | `endTime: z.string(),` |
| schemas\attendance.ts | 88 | `reason: z.string().nullable().optional(),` |
| schemas\attendance.ts | 91 | `approvedAt: z.string().nullable().optional(),` |
| schemas\attendance.ts | 92 | `createdAt: z.string(),` |
| schemas\attendance.ts | 93 | `updatedAt: z.string(),` |
| schemas\attendance.ts | 94 | `employeeName: z.string().optional(),` |
| schemas\attendance.ts | 95 | `deptName: z.string().optional(),` |
| schemas\attendance.ts | 96 | `approverName: z.string().optional(),` |
| schemas\attendance.ts | 114 | `clockTime: z.string(),` |
| schemas\attendance.ts | 117 | `deviceInfo: z.record(z.string(), z.unknown()).nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 118 | `location: z.record(z.string(), z.unknown()).nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 120 | `remark: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 121 | `createdAt: z.string(),` |
| schemas\attendance.ts | 122 | `employeeNo: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 123 | `employeeName: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 124 | `deptName: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 125 | `operatorName: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 149 | `employeeName: z.string(),` |
| schemas\attendance.ts | 150 | `deptName: z.string(),` |
| schemas\attendance.ts | 151 | `workDate: z.string(),` |
| schemas\attendance.ts | 152 | `shiftName: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 153 | `startTime: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 154 | `endTime: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 155 | `checkInTime: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 156 | `checkOutTime: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 163 | `remark: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 164 | `employeeNo: z.string().nullable().optional().transform(v => v ?? undefined),` |
| schemas\attendance.ts | 181 | `employeeName: z.string(),` |
| schemas\attendance.ts | 182 | `deptName: z.string(),` |
| schemas\attendance.ts | 184 | `correctionTime: z.string(),` |
| schemas\attendance.ts | 185 | `operatorName: z.string(),` |
| schemas\attendance.ts | 186 | `updatedAt: z.string(),` |
| schemas\attendance.ts | 187 | `remark: z.string().optional(),` |
| schemas\attendance.ts | 205 | `day_switch_time: z.string(),` |
| schemas\attendance.ts | 206 | `auto_calc_time: z.string().optional(),` |
| schemas\auth.ts | 5 | `username: z.string().min(1),` |
| schemas\auth.ts | 6 | `password: z.string().min(1),` |
| schemas\auth.ts | 10 | `token: z.string(),` |
| schemas\auth.ts | 13 | `username: z.string(),` |
| schemas\auth.ts | 15 | `name: z.string().optional(),` |
| schemas\common.ts | 11 | `code: z.string(),` |
| schemas\common.ts | 12 | `message: z.string(),` |
| schemas\common.ts | 46 | `sortBy: z.string().optional(),` |
| schemas\department.ts | 9 | `name: z.string(),` |
| schemas\department.ts | 20 | `name: z.string(),` |
| schemas\department.ts | 23 | `createdAt: z.string(),` |
| schemas\department.ts | 24 | `updatedAt: z.string(),` |
| schemas\department.ts | 30 | `name: z.string().min(1),` |
| schemas\department.ts | 36 | `name: z.string().min(1).optional(),` |
| schemas\employee.ts | 10 | `employeeNo: z.string(),` |
| schemas\employee.ts | 11 | `name: z.string(),` |
| schemas\employee.ts | 12 | `phone: z.string().nullable().optional(),` |
| schemas\employee.ts | 13 | `email: z.string().nullable().optional(),` |
| schemas\employee.ts | 15 | `deptName: z.string().optional(),` |
| schemas\employee.ts | 17 | `hireDate: z.string().nullable().optional(),` |
| schemas\employee.ts | 19 | `username: z.string().nullable().optional(),` |
| schemas\employee.ts | 20 | `createdAt: z.string(),` |
| schemas\employee.ts | 21 | `updatedAt: z.string(),` |
| schemas\statistics.ts | 5 | `employeeNo: z.string(),` |
| schemas\statistics.ts | 6 | `employeeName: z.string(),` |
| schemas\statistics.ts | 8 | `deptName: z.string(),` |
| schemas\statistics.ts | 22 | `daily: z.array(z.string()).optional(),` |
| schemas\statistics.ts | 27 | `deptName: z.string(),` |
| schemas\statistics.ts | 39 | `date: z.string(),` |
| schemas\statistics.ts | 43 | `status: z.string(),` |
| schemas\user.ts | 8 | `username: z.string(),` |
| schemas\user.ts | 12 | `createdAt: z.string(),` |
| schemas\user.ts | 13 | `updatedAt: z.string(),` |
| schemas\user.ts | 17 | `username: z.string().min(1),` |
| schemas\user.ts | 18 | `password: z.string().min(6).optional(),` |
| schemas\user.ts | 25 | `username: z.string(),` |
| schemas\user.ts | 28 | `employeeName: z.string().optional(),` |
| schemas\user.ts | 29 | `createdAt: z.string(),` |
| services\api.test.ts | 23 | `const schema = z.string();` |
| services\correction.ts | 56 | `message: z.string(),` |
| services\correction.ts | 57 | `batchId: z.string()` |
| services\correction.ts | 74 | `message: z.string().optional(),` |
| services\correction.ts | 75 | `error: z.string().optional()` |
| services\leave.ts | 10 | `startTime: z.string(),` |
| services\leave.ts | 11 | `endTime: z.string(),` |
| services\leave.ts | 12 | `reason: z.string().nullable().optional(),` |
| services\leave.ts | 15 | `approvedAt: z.string().nullable().optional(),` |
| services\leave.ts | 16 | `createdAt: z.string(),` |
| services\leave.ts | 17 | `updatedAt: z.string(),` |
| services\leave.ts | 18 | `employeeName: z.string().optional(),` |
| services\leave.ts | 19 | `deptName: z.string().optional(),` |
| services\leave.ts | 20 | `approverName: z.string().optional(),` |
| services\statistics.ts | 36 | `date: z.string(),` |
| services\statistics.ts | 54 | `message: z.string().optional(),` |
| services\statistics.ts | 55 | `error: z.string().optional()` |
| services\statistics.ts | 62 | `message: z.string(),` |
| services\statistics.ts | 63 | `batchId: z.string()` |
