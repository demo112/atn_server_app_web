import * as fc from 'fast-check';
import { AttDailyRecord, AttTimePeriod, AttLeave, AttendanceStatus, LeaveType, LeaveStatus } from '@prisma/client';

// Helper: HH:mm generator
export const timeStringArb = fc.tuple(
  fc.integer({ min: 0, max: 23 }),
  fc.integer({ min: 0, max: 59 })
).map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);

// Helper: Reasonable date generator (2020-2030)
const dateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') });

export const attTimePeriodArb = fc.record({
  id: fc.integer({ min: 1 }),
  name: fc.string(),
  type: fc.constantFrom(0, 1),
  startTime: fc.option(timeStringArb, { nil: undefined }), // Prisma optional is null, but type def might be string | null
  endTime: fc.option(timeStringArb, { nil: undefined }),
  restStartTime: fc.option(timeStringArb, { nil: undefined }),
  restEndTime: fc.option(timeStringArb, { nil: undefined }),
  rules: fc.constant({}), 
  createdAt: dateArb,
  updatedAt: dateArb
}) as fc.Arbitrary<AttTimePeriod>;

export const attLeaveArb = fc.record({
  id: fc.integer({ min: 1 }),
  employeeId: fc.integer({ min: 1 }),
  type: fc.constantFrom('annual', 'sick', 'personal', 'business_trip') as fc.Arbitrary<LeaveType>,
  startTime: dateArb,
  endTime: dateArb,
  reason: fc.option(fc.string(), { nil: undefined }),
  status: fc.constantFrom('approved') as fc.Arbitrary<LeaveStatus>, 
  approverId: fc.option(fc.integer(), { nil: undefined }),
  approvedAt: fc.option(dateArb, { nil: undefined }),
  createdAt: dateArb,
  updatedAt: dateArb
}) as fc.Arbitrary<AttLeave>;

export const attDailyRecordArb = fc.record({
  id: fc.bigInt({ min: 1n }),
  employeeId: fc.integer({ min: 1 }),
  workDate: dateArb,
  shiftId: fc.option(fc.integer(), { nil: undefined }),
  periodId: fc.option(fc.integer(), { nil: undefined }),
  checkInTime: fc.option(dateArb, { nil: undefined }),
  checkOutTime: fc.option(dateArb, { nil: undefined }),
  status: fc.constantFrom('normal', 'late', 'early_leave', 'absent', 'leave', 'business_trip') as fc.Arbitrary<AttendanceStatus>,
  actualMinutes: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
  effectiveMinutes: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
  lateMinutes: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
  earlyLeaveMinutes: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
  absentMinutes: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
  leaveMinutes: fc.option(fc.integer({ min: 0 }), { nil: undefined }),
  remark: fc.option(fc.string(), { nil: undefined }),
  createdAt: dateArb,
  updatedAt: dateArb
}) as fc.Arbitrary<AttDailyRecord>;
