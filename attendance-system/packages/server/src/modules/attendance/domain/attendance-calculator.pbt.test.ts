
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { AttendanceCalculator } from './attendance-calculator';
import { attDailyRecordArb, attTimePeriodArb, attLeaveArb } from '../../../common/test/arbitraries/prisma-types.arb';
import { AttLeave, AttendanceStatus } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

describe('AttendanceCalculator PBT', () => {
  const calculator = new AttendanceCalculator();

  it('should always return a valid calculation result', () => {
    fc.assert(
      fc.property(
        attDailyRecordArb,
        attTimePeriodArb,
        fc.array(attLeaveArb),
        (record, period, leaves) => {
          // Pre-conditions
          fc.pre(isValidDate(record.workDate));
          if (record.checkInTime) fc.pre(isValidDate(record.checkInTime));
          if (record.checkOutTime) fc.pre(isValidDate(record.checkOutTime));
          
          // Execute
          const result = calculator.calculate(record, period, leaves);

          // Invariants
          expect(result).toBeDefined();
          expect(result.status).toBeDefined();
          expect(result.workDate).toBeDefined();

          expect(result.lateMinutes).toBeGreaterThanOrEqual(0);
          expect(result.earlyLeaveMinutes).toBeGreaterThanOrEqual(0);
          expect(result.absentMinutes).toBeGreaterThanOrEqual(0);
          expect(result.leaveMinutes).toBeGreaterThanOrEqual(0);
          expect(result.actualMinutes).toBeGreaterThanOrEqual(0);
          
          expect(typeof result.status).toBe('string');
        }
      )
    );
  });

  it('should calculate leave minutes correctly when leaves cover the shift', () => {
    // Custom arbitrary to ensure overlap
    const overlapScenarioArb = attDailyRecordArb.chain(record => {
      return attTimePeriodArb.chain(period => {
        return fc.record({
          record: fc.constant(record),
          period: fc.constant(period),
          leaveType: fc.constantFrom('annual', 'sick'),
        }).map(({ record, period, leaveType }) => {
          const workDate = dayjs.utc(record.workDate);
          const leaveStart = workDate.subtract(1, 'day').toDate();
          const leaveEnd = workDate.add(2, 'day').toDate();
          
          const leave: AttLeave = {
             id: 1,
             employeeId: record.employeeId,
             type: leaveType as any,
             startTime: leaveStart,
             endTime: leaveEnd,
             status: 'approved',
             reason: 'test',
             approverId: null,
             approvedAt: new Date(),
             createdAt: new Date(),
             updatedAt: new Date()
          };
          return { record, period, leaves: [leave] };
        });
      });
    });

    fc.assert(
      fc.property(overlapScenarioArb, ({ record, period, leaves }) => {
        const result = calculator.calculate(record, period, leaves);
        
        // Handle 0-length shifts (e.g. 03:01 - 03:01)
        const start = period.startTime || '09:00';
        const end = period.endTime || '18:00';
        const isZeroLength = start === end;
        if (isZeroLength) {
             expect(result.leaveMinutes).toBe(0);
        } else {
             expect(result.leaveMinutes).toBeGreaterThan(0);
        }
      })
    );
  });
});

function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d.getTime());
}
