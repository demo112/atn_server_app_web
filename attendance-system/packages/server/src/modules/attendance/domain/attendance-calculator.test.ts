import { describe, it, expect } from 'vitest';
import { AttendanceCalculator } from './attendance-calculator';
import { AttDailyRecord, AttTimePeriod, AttendanceStatus } from '@prisma/client';
import dayjs from 'dayjs';

describe('AttendanceCalculator', () => {
  const calculator = new AttendanceCalculator();
  
  const mockPeriod: AttTimePeriod = {
    id: 1,
    name: 'Normal Shift',
    type: 0,
    startTime: '09:00',
    endTime: '18:00',
    restStartTime: '12:00',
    restEndTime: '13:00',
    rules: {
      lateGraceMinutes: 10,
      earlyLeaveGraceMinutes: 10,
      absentTime: 120 // 2 hours
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const baseRecord: AttDailyRecord = {
    id: BigInt(1),
    employeeId: 1,
    workDate: new Date('2024-02-01T00:00:00.000Z'),
    shiftId: 1,
    periodId: 1,
    checkInTime: null,
    checkOutTime: null,
    status: 'normal',
    actualMinutes: 0,
    effectiveMinutes: 0,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    absentMinutes: 0,
    remark: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it('should return normal when check-in/out are within range', () => {
    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: new Date('2024-02-01T08:55:00.000Z'), // 08:55
      checkOutTime: new Date('2024-02-01T18:05:00.000Z') // 18:05
    };

    const result = calculator.calculate(record, mockPeriod);
    
    expect(result.status).toBe('normal');
    expect(result.lateMinutes).toBe(0);
    expect(result.earlyLeaveMinutes).toBe(0);
  });

  it('should detect late within grace period as normal', () => {
    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: new Date('2024-02-01T09:05:00.000Z'), // 09:05 (grace 10)
      checkOutTime: new Date('2024-02-01T18:00:00.000Z')
    };

    const result = calculator.calculate(record, mockPeriod);
    expect(result.status).toBe('normal');
    expect(result.lateMinutes).toBe(0); // Grace period implies not late? Or late but status normal? 
    // Logic says: if checkIn > start + grace => late. So <= start + grace is NOT late.
  });

  it('should detect late', () => {
    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: new Date('2024-02-01T09:15:00.000Z'), // 09:15 (> 09:10)
      checkOutTime: new Date('2024-02-01T18:00:00.000Z')
    };

    const result = calculator.calculate(record, mockPeriod);
    expect(result.status).toBe('late');
    expect(result.lateMinutes).toBe(15);
  });

  it('should detect early leave', () => {
    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: new Date('2024-02-01T09:00:00.000Z'),
      checkOutTime: new Date('2024-02-01T17:45:00.000Z') // 17:45 (< 17:50)
    };

    const result = calculator.calculate(record, mockPeriod);
    expect(result.status).toBe('early_leave');
    expect(result.earlyLeaveMinutes).toBe(15);
  });

  it('should detect absent when missing check-in/out', () => {
    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: null,
      checkOutTime: null
    };

    const result = calculator.calculate(record, mockPeriod);
    expect(result.status).toBe('absent');
  });

  it('should detect absent when late exceeds threshold', () => {
    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: new Date('2024-02-01T11:30:00.000Z'), // 11:30 (> 2 hours late)
      checkOutTime: new Date('2024-02-01T18:00:00.000Z')
    };

    const result = calculator.calculate(record, mockPeriod);
    expect(result.status).toBe('absent');
    expect(result.lateMinutes).toBe(150);
  });

  it('should handle cross-day shift', () => {
    const crossDayPeriod: AttTimePeriod = {
      ...mockPeriod,
      startTime: '20:00',
      endTime: '04:00'
    };

    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: new Date('2024-02-01T20:05:00.000Z'),
      checkOutTime: new Date('2024-02-02T04:05:00.000Z') // Next day
    };

    const result = calculator.calculate(record, crossDayPeriod);
    expect(result.status).toBe('normal');
  });
});
