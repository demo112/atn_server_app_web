import * as fc from 'fast-check';
import { Shift, ShiftPeriod } from '../../types/attendance/base';
import { timePeriodArb } from './common.arb';

/**
 * 生成 ShiftPeriod
 * 确保 dayOfCycle 在 1-7 之间 (假设周循环)
 */
export const shiftPeriodArb = fc.record({
  id: fc.nat(),
  shiftId: fc.nat(),
  periodId: fc.nat(),
  dayOfCycle: fc.integer({ min: 1, max: 7 }),
  sortOrder: fc.integer({ min: 1, max: 5 }),
  period: fc.option(timePeriodArb)
});

/**
 * 生成 Shift 对象
 * 确保 periods 是 ShiftPeriod 的数组
 */
export const shiftArb = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 2, maxLength: 20 }),
  cycleDays: fc.constant(7), // 目前假设周循环
  periods: fc.array(shiftPeriodArb, { maxLength: 5 })
});
