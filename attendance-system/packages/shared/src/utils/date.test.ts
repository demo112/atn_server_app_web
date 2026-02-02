import { describe, it, expect } from 'vitest';
import { formatDate, parseDate, calculateWorkHours } from './date';

describe('formatDate', () => {
  it('格式化日期为 YYYY-MM-DD', () => {
    const date = new Date('2026-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('2026-01-15');
  });
});

describe('parseDate', () => {
  it('解析日期字符串', () => {
    const result = parseDate('2026-01-15');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0); // 0-indexed
    expect(result.getDate()).toBe(15);
  });
});

describe('calculateWorkHours', () => {
  it('计算工时，扣除午休', () => {
    const clockIn = new Date('2026-01-15T09:00:00');
    const clockOut = new Date('2026-01-15T18:00:00');
    
    const hours = calculateWorkHours(clockIn, clockOut, 60);
    
    expect(hours).toBe(8); // 9小时 - 1小时午休
  });

  it('工时不能为负', () => {
    const clockIn = new Date('2026-01-15T09:00:00');
    const clockOut = new Date('2026-01-15T09:30:00');
    
    const hours = calculateWorkHours(clockIn, clockOut, 60);
    
    expect(hours).toBe(0);
  });
});
