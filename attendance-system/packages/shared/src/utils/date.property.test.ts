import { describe, it } from 'vitest';
import fc from 'fast-check';
import { formatDate, parseDate, calculateWorkHours } from './date';

describe('date 契约验证', () => {
  it('往返属性：parseDate(formatDate(date)) 保持日期部分不变', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }).filter(d => !isNaN(d.getTime())),
        (date) => {
          const formatted = formatDate(date);
          const parsed = parseDate(formatted);
          return (
            parsed.getFullYear() === date.getFullYear() &&
            parsed.getMonth() === date.getMonth() &&
            parsed.getDate() === date.getDate()
          );
        }
      )
    );
  });

  describe('calculateWorkHours', () => {
    const validDateArb = fc.date({ min: new Date('1900-01-01'), max: new Date('2100-01-01') }).filter(d => !isNaN(d.getTime()));
    const validBreakArb = fc.float({ min: 0, max: 24 * 60, noNaN: true });

    it('应始终返回非负数', () => {
      fc.assert(
        fc.property(
          validDateArb,
          validDateArb,
          validBreakArb,
          (start, end, breakMins) => {
            const hours = calculateWorkHours(start, end, breakMins);
            return hours >= 0;
          }
        )
      );
    });

    it('结束时间越晚，工时应该越长（或保持为0）', () => {
      fc.assert(
        fc.property(
          validDateArb,
          validDateArb,
          fc.nat({ max: 24 * 60 * 60 * 1000 }), // extra time in ms
          validBreakArb, // fixed break
          (start, end, extra, breakMins) => {
            if (end < start) return true; // skip invalid range
            // Ensure end + extra is still valid date (simple check or ignore edge case)
            // But since we use validDateArb (max 2100), adding 1 day is fine usually.
            const h1 = calculateWorkHours(start, end, breakMins);
            const h2 = calculateWorkHours(start, new Date(end.getTime() + extra), breakMins);
            return h2 >= h1;
          }
        )
      );
    });

    it('休息时间越长，工时应该越短（或保持为0）', () => {
      fc.assert(
        fc.property(
          validDateArb,
          validDateArb,
          fc.float({ min: 0, max: 100, noNaN: true }), 
          fc.float({ min: 0, max: 100, noNaN: true }),
          (start, end, b1, b2) => {
            if (end < start) return true;
            const breakSmall = Math.min(b1, b2);
            const breakLarge = Math.max(b1, b2);
            
            const h1 = calculateWorkHours(start, end, breakSmall);
            const h2 = calculateWorkHours(start, end, breakLarge);
            return h1 >= h2;
          }
        )
      );
    });
  });
});

