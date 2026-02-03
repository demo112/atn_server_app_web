import fc from 'fast-check';
import { TimePeriodRulesSchema } from '../attendance';

describe('Attendance Schemas Property Tests', () => {
  test('TimePeriodRulesSchema should parse valid partial objects', () => {
    const rulesArb = fc.record({
      minWorkHours: fc.float({min: 0, max: 24, noNaN: true}),
      maxWorkHours: fc.float({min: 0, max: 24, noNaN: true}),
      lateGraceMinutes: fc.integer({min: 0, max: 120}),
      earlyLeaveGraceMinutes: fc.integer({min: 0, max: 120}),
      checkInStartOffset: fc.integer({min: 0}),
      checkInEndOffset: fc.integer({min: 0}),
      checkOutStartOffset: fc.integer({min: 0}),
      checkOutEndOffset: fc.integer({min: 0}),
      absentTime: fc.float({min: 0, max: 24, noNaN: true}),
    }, { requiredKeys: [] });

    fc.assert(
      fc.property(rulesArb, (rules) => {
        const result = TimePeriodRulesSchema.safeParse(rules);
        expect(result.success).toBe(true);
      })
    );
  });

  test('TimePeriodRulesSchema should reject invalid types', () => {
    // Test that strings instead of numbers fail validation
    const invalidRulesArb = fc.record({
      minWorkHours: fc.string(),
      lateGraceMinutes: fc.string(),
    }, { requiredKeys: ['minWorkHours'] });

    fc.assert(
      fc.property(invalidRulesArb, (rules) => {
        const result = TimePeriodRulesSchema.safeParse(rules);
        expect(result.success).toBe(false);
      })
    );
  });
});
