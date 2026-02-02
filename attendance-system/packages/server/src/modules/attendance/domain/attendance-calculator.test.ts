import { describe, it, expect } from 'vitest';
import { AttendanceCalculator } from './attendance-calculator';
import { AttDailyRecord, AttTimePeriod, AttendanceStatus, AttLeave, LeaveType, LeaveStatus } from '@prisma/client';
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
    expect(result.lateMinutes).toBe(0); 
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
    expect(result.absentMinutes).toBe(540); // 9 hours
  });

  describe('Leave Integration', () => {
    it('should return leave status when full day leave exists', () => {
      const record = { ...baseRecord };
      const leaves: AttLeave[] = [{
        id: 1,
        employeeId: 1,
        type: LeaveType.annual,
        startTime: new Date('2024-02-01T09:00:00.000Z'),
        endTime: new Date('2024-02-01T18:00:00.000Z'),
        status: LeaveStatus.approved,
        reason: null,
        approverId: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      const result = calculator.calculate(record, mockPeriod, leaves);
      expect(result.status).toBe('leave');
      expect(result.absentMinutes).toBe(0);
      expect(result.effectiveMinutes).toBe(0);
    });

    it('should deduct late minutes if covered by leave', () => {
      const record: AttDailyRecord = {
        ...baseRecord,
        checkInTime: new Date('2024-02-01T10:00:00.000Z'), // 1 hour late
        checkOutTime: new Date('2024-02-01T18:00:00.000Z')
      };
      const leaves: AttLeave[] = [{
        id: 1,
        employeeId: 1,
        type: LeaveType.personal,
        startTime: new Date('2024-02-01T09:00:00.000Z'),
        endTime: new Date('2024-02-01T10:00:00.000Z'), // Covers the late hour
        status: LeaveStatus.approved,
        reason: null,
        approverId: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      
      const result = calculator.calculate(record, mockPeriod, leaves);
      expect(result.status).toBe('normal');
      expect(result.lateMinutes).toBe(0);
    });

    it('should deduct early leave minutes if covered by leave', () => {
      const record: AttDailyRecord = {
        ...baseRecord,
        checkInTime: new Date('2024-02-01T09:00:00.000Z'),
        checkOutTime: new Date('2024-02-01T17:00:00.000Z') // 1 hour early
      };
      const leaves: AttLeave[] = [{
        id: 1,
        employeeId: 1,
        type: LeaveType.personal,
        startTime: new Date('2024-02-01T17:00:00.000Z'),
        endTime: new Date('2024-02-01T18:00:00.000Z'), // Covers the early hour
        status: LeaveStatus.approved,
        reason: null,
        approverId: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      
      const result = calculator.calculate(record, mockPeriod, leaves);
      expect(result.status).toBe('normal');
      expect(result.earlyLeaveMinutes).toBe(0);
    });

    it('should deduct absent minutes for partial leave when absent', () => {
      const record = { ...baseRecord, checkInTime: null, checkOutTime: null };
      const leaves: AttLeave[] = [{
        id: 1,
        employeeId: 1,
        type: LeaveType.sick,
        startTime: new Date('2024-02-01T09:00:00.000Z'),
        endTime: new Date('2024-02-01T13:00:00.000Z'), // 4 hours
        status: LeaveStatus.approved,
        reason: null,
        approverId: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      
      const result = calculator.calculate(record, mockPeriod, leaves);
      expect(result.status).toBe('absent');
      // Shift 9h (540m). Leave 4h (240m). Absent = 300m.
      expect(result.absentMinutes).toBe(300);
    });
  });
});
