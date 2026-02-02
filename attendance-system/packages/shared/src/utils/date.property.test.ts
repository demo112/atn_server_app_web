import { describe, it } from 'vitest';
import fc from 'fast-check';
import { formatDate, parseDate } from './date';

describe('date 契约验证', () => {
  it('往返属性：parseDate(formatDate(date)) 保持日期部分不变', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-01-01') }),
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
});
