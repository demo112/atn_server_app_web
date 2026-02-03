import * as fc from 'fast-check';
import { TimePeriod } from '../../types/attendance/base';

/**
 * 基础生成器：生成 YYYY-MM-DD 格式日期
 */
export const dateStringArb = fc.date({ 
  min: new Date('2024-01-01'), 
  max: new Date('2025-12-31') 
}).map(d => d.toISOString().split('T')[0]);

/**
 * 基础生成器：生成 HH:mm 格式时间
 */
export const timeStringArb = fc.tuple(
  fc.integer({ min: 0, max: 23 }),
  fc.integer({ min: 0, max: 59 })
).map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);

/**
 * 业务生成器：生成合法的时间段（startTime < endTime）
 */
export const timePeriodRangeArb = fc.tuple(
  fc.integer({ min: 0, max: 22 * 60 }), // 开始时间（分钟计，00:00 - 22:00）
  fc.integer({ min: 30, max: 120 })     // 持续时间（分钟计，30min - 2h）
).map(([startMin, duration]) => {
  const h1 = Math.floor(startMin / 60);
  const m1 = startMin % 60;
  const h2 = Math.floor((startMin + duration) / 60);
  const m2 = (startMin + duration) % 60;
  
  return {
    startTime: `${h1.toString().padStart(2, '0')}:${m1.toString().padStart(2, '0')}`,
    endTime: `${h2.toString().padStart(2, '0')}:${m2.toString().padStart(2, '0')}`
  };
});

/**
 * 领域生成器：生成 TimePeriod 对象
 */
export const timePeriodArb = fc.record({
  id: fc.nat(),
  name: fc.string({ minLength: 2, maxLength: 10 }),
  type: fc.constantFrom(0, 1),
  startTime: timeStringArb,
  endTime: timeStringArb,
  restStartTime: fc.option(timeStringArb),
  restEndTime: fc.option(timeStringArb),
  createdAt: dateStringArb,
  updatedAt: dateStringArb
});
