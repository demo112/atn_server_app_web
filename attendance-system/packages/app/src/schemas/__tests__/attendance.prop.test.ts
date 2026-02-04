import fc from 'fast-check';
import { 
  TimePeriodRulesSchema, 
  LeaveVoSchema, 
  ScheduleSchema
} from '../attendance';
import { LeaveType, LeaveStatus } from '@attendance/shared';

describe('Attendance Schemas Properties', () => {
  // Helper to generate valid dates using timestamps to avoid Invalid Date issues
  const dateArb = fc.integer({ min: 1600000000000, max: 1900000000000 }).map(t => new Date(t).toISOString());
  
  // Helper for optional fields (undefined instead of null)
  const optional = <T>(arb: fc.Arbitrary<T>) => fc.option(arb, { nil: undefined });

  // 1. TimePeriodRules Schema
  const rulesArb = fc.record({
    minWorkHours: optional(fc.double({ min: 0, max: 24, noNaN: true })),
    maxWorkHours: optional(fc.double({ min: 0, max: 24, noNaN: true })),
    lateGraceMinutes: optional(fc.integer({ min: 0, max: 60 })),
    earlyLeaveGraceMinutes: optional(fc.integer({ min: 0, max: 60 })),
    checkInStartOffset: optional(fc.integer({ min: 0, max: 60 })),
    checkInEndOffset: optional(fc.integer({ min: 0, max: 60 })),
    checkOutStartOffset: optional(fc.integer({ min: 0, max: 60 })),
    checkOutEndOffset: optional(fc.integer({ min: 0, max: 60 })),
    absentTime: optional(fc.integer({ min: 0, max: 480 })),
  }, { requiredKeys: [] });

  test('TimePeriodRulesSchema should validate valid rules', () => {
    fc.assert(
      fc.property(rulesArb, (rules) => {
        const result = TimePeriodRulesSchema.safeParse(rules);
        expect(result.success).toBe(true);
      })
    );
  });

  test('TimePeriodRulesSchema should reject negative numbers', () => {
    fc.assert(
      fc.property(fc.double({ max: -0.01 }), (negativeVal) => {
        const rules = { minWorkHours: negativeVal };
        const result = TimePeriodRulesSchema.safeParse(rules);
        expect(result.success).toBe(false);
      })
    );
  });

  // 2. LeaveVo Schema
  const leaveVoArb = fc.record({
    id: fc.integer(),
    employeeId: fc.integer(),
    type: fc.constantFrom(...Object.values(LeaveType)),
    startTime: dateArb,
    endTime: dateArb,
    reason: fc.option(fc.string(), { nil: undefined }), // nullable().optional() -> accepts null or undefined. fc.option default is null, which is fine for nullable.
    status: fc.constantFrom(...Object.values(LeaveStatus)),
    approverId: fc.option(fc.integer(), { nil: undefined }), // nullable().optional()
    approvedAt: fc.option(dateArb, { nil: undefined }),
    createdAt: dateArb,
    updatedAt: dateArb,
    employeeName: optional(fc.string()), // optional() only -> needs undefined
    deptName: optional(fc.string()),
    approverName: optional(fc.string()),
  });

  test('LeaveVoSchema should validate valid leave records', () => {
    fc.assert(
      fc.property(leaveVoArb, (leave) => {
        const result = LeaveVoSchema.safeParse(leave);
        expect(result.success).toBe(true);
      })
    );
  });

  // 3. Schedule Schema
  test('ScheduleSchema should validate valid schedules', () => {
    fc.assert(
      fc.property(fc.record({
        id: fc.integer(),
        employeeId: fc.integer(),
        shiftId: fc.integer(),
        startDate: dateArb,
        endDate: dateArb,
        // Optional nested objects can be tested separately or with simple stubs
      }), (schedule) => {
        const result = ScheduleSchema.safeParse(schedule);
        expect(result.success).toBe(true);
      })
    );
  });
});
