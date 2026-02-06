
import { describe, it, expect } from 'vitest';
import { AttendanceCalculator } from './attendance-calculator';
import { AttDailyRecord, AttTimePeriod } from '@prisma/client';
import dayjs from 'dayjs';

describe('AttendanceCalculator Timezone Issue', () => {
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
      absentTime: 120 
    } as any,
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
    updatedAt: new Date(),
    leaveMinutes: 0,
    lateCount: 0,
    earlyLeaveCount: 0,
    absentCount: 0
  } as any;

  it('should handle UTC+8 correctly', () => {
    // Scenario:
    // Shift: 09:00 - 18:00 (Local Time)
    // CheckIn: 08:55 (Local) -> 00:55 (UTC)
    // CheckOut: 18:05 (Local) -> 10:05 (UTC)
    // Expected: Normal
    
    const record: AttDailyRecord = {
      ...baseRecord,
      checkInTime: new Date('2024-02-01T00:55:00.000Z'), // 00:55 UTC = 08:55 UTC+8
      checkOutTime: new Date('2024-02-01T10:05:00.000Z') // 10:05 UTC = 18:05 UTC+8
    };

    const result = calculator.calculate(record, mockPeriod);
    
    // If logic is broken (using UTC directly), 10:05 < 18:00, so it will be Early Leave
    // If logic is correct (converting shift to UTC or record to Local), it should be Normal
    expect(result.status).toBe('normal');
    expect(result.earlyLeaveMinutes).toBe(0);
  });
});
