import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { TimePeriodRulesSchema } from '../attendance';

describe('TimePeriodRulesSchema Property Tests', () => {
  // 1. 验证 Schema 能够接受合理的数值
  test('should accept valid configuration values', () => {
    fc.assert(
      fc.property(
        fc.record({
          minWorkHours: fc.double({ min: 0, max: 24, noNaN: true }),
          maxWorkHours: fc.double({ min: 0, max: 24, noNaN: true }),
          lateGraceMinutes: fc.integer({ min: 0, max: 120 }),
          earlyLeaveGraceMinutes: fc.integer({ min: 0, max: 120 }),
          checkInStartOffset: fc.integer({ min: 0, max: 120 }),
          checkInEndOffset: fc.integer({ min: 0, max: 120 }),
          checkOutStartOffset: fc.integer({ min: 0, max: 120 }),
          checkOutEndOffset: fc.integer({ min: 0, max: 120 }),
          absentTime: fc.integer({ min: 0, max: 480 }),
        }),
        (values) => {
          const result = TimePeriodRulesSchema.safeParse(values);
          expect(result.success).toBe(true);
        }
      )
    );
  });

  // 2. 验证 Schema 拒绝负数
  test('should reject negative numbers', () => {
    fc.assert(
      fc.property(fc.double({ max: -0.1, noNaN: true }), (val) => {
        const result = TimePeriodRulesSchema.safeParse({ minWorkHours: val });
        expect(result.success).toBe(false);
      })
    );
  });

  // 3. 验证 Schema 拒绝非数字类型
  test('should reject non-number types', () => {
    fc.assert(
      fc.property(fc.string(), (val) => {
        const result = TimePeriodRulesSchema.safeParse({ minWorkHours: val });
        expect(result.success).toBe(false);
      })
    );
  });
});
