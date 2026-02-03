import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { AttendanceCorrectionService } from './attendance-correction.service';
import { CorrectionType, LeaveStatus, AttendanceStatus } from '@prisma/client';
import dayjs from 'dayjs';

// Define mocks
const prismaTransaction = vi.fn();
const prismaCorrectionCreate = vi.fn();
const prismaCorrectionFindUnique = vi.fn();
const prismaCorrectionUpdate = vi.fn();
const prismaCorrectionDelete = vi.fn();
const prismaCorrectionFindMany = vi.fn();
const prismaDailyRecordFindUnique = vi.fn();
const prismaDailyRecordUpdate = vi.fn();
const prismaClockRecordFindMany = vi.fn();
const prismaLeaveFindMany = vi.fn();

vi.mock('../../common/db/prisma', () => ({
  prisma: {
    $transaction: (cb: any) => cb({
      attCorrection: {
        create: (...args: any[]) => prismaCorrectionCreate(...args),
        findUnique: (...args: any[]) => prismaCorrectionFindUnique(...args),
        update: (...args: any[]) => prismaCorrectionUpdate(...args),
        delete: (...args: any[]) => prismaCorrectionDelete(...args),
        findMany: (...args: any[]) => prismaCorrectionFindMany(...args),
      },
      attDailyRecord: {
        findUnique: (...args: any[]) => prismaDailyRecordFindUnique(...args),
        update: (...args: any[]) => prismaDailyRecordUpdate(...args),
      },
      attClockRecord: {
        findMany: (...args: any[]) => prismaClockRecordFindMany(...args),
      },
      attLeave: {
        findMany: (...args: any[]) => prismaLeaveFindMany(...args),
      },
    }),
  },
}));

describe('AttendanceCorrectionService PBT', () => {
  let service: AttendanceCorrectionService;

  beforeEach(() => {
    service = new AttendanceCorrectionService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Arbitraries
  const dateArb = fc.date({ min: new Date('2023-01-01'), max: new Date('2025-12-31') });
  
  const dailyRecordIdArb = fc.bigInt({ min: 1n }).map(n => n.toString());
  
  const supplementCheckInDtoArb = fc.record({
    dailyRecordId: dailyRecordIdArb,
    checkInTime: dateArb.map(d => d.toISOString()),
    remark: fc.option(fc.string(), { nil: undefined }),
  });

  const supplementCheckOutDtoArb = fc.record({
    dailyRecordId: dailyRecordIdArb,
    checkOutTime: dateArb.map(d => d.toISOString()),
    remark: fc.option(fc.string(), { nil: undefined }),
  });

  // Mock Data Generators
  const mockPeriod = {
    id: 1,
    startTime: '09:00',
    endTime: '18:00',
    lateGraceMinutes: 15,
    earlyLeaveGraceMinutes: 15,
  };

  const mockDailyRecord = (id: string, workDate: Date) => ({
    id: BigInt(id),
    employeeId: 1,
    workDate,
    period: mockPeriod,
    employee: { name: 'Test', department: { name: 'Dept' } },
    shift: { name: 'Normal' },
  });

  it('should successfully check-in and update daily record', async () => {
    await fc.assert(
      fc.asyncProperty(supplementCheckInDtoArb, fc.integer({min: 1}), async (dto, operatorId) => {
        // Setup Mocks
        const recordId = BigInt(dto.dailyRecordId);
        const workDate = new Date(dayjs(dto.checkInTime).format('YYYY-MM-DD'));
        
        // Mock create correction
        prismaCorrectionCreate.mockResolvedValue({
          id: 100,
          dailyRecordId: recordId,
          type: CorrectionType.check_in,
          correctionTime: new Date(dto.checkInTime),
        });

        // Mock find daily record
        prismaDailyRecordFindUnique.mockResolvedValue(mockDailyRecord(dto.dailyRecordId, workDate));
        
        // Mock update correction (employeeId fix)
        prismaCorrectionUpdate.mockResolvedValue({});

        // Mock find context data
        prismaClockRecordFindMany.mockResolvedValue([]);
        prismaCorrectionFindMany.mockResolvedValue([
          { type: CorrectionType.check_in, correctionTime: new Date(dto.checkInTime) }
        ]);
        prismaLeaveFindMany.mockResolvedValue([]);

        // Mock update daily record
        prismaDailyRecordUpdate.mockImplementation(({ data }) => Promise.resolve({
          ...mockDailyRecord(dto.dailyRecordId, workDate),
          ...data,
          checkInTime: new Date(dto.checkInTime), // Expected update
        }));

        // Execute
        const result = await service.checkIn(dto, operatorId);

        // Verify
        expect(result.success).toBe(true);
        expect(prismaCorrectionCreate).toHaveBeenCalled();
        expect(prismaDailyRecordUpdate).toHaveBeenCalledWith(expect.objectContaining({
          where: { id: recordId },
          data: expect.objectContaining({
            checkInTime: new Date(dto.checkInTime)
          })
        }));
      })
    );
  });

  it('should successfully check-out and update daily record', async () => {
    await fc.assert(
      fc.asyncProperty(supplementCheckOutDtoArb, fc.integer({min: 1}), async (dto, operatorId) => {
        // Setup Mocks
        const recordId = BigInt(dto.dailyRecordId);
        const workDate = new Date(dayjs(dto.checkOutTime).format('YYYY-MM-DD'));
        
        // Mock create correction
        prismaCorrectionCreate.mockResolvedValue({
          id: 100,
          dailyRecordId: recordId,
          type: CorrectionType.check_out,
          correctionTime: new Date(dto.checkOutTime),
        });

        // Mock find daily record
        prismaDailyRecordFindUnique.mockResolvedValue(mockDailyRecord(dto.dailyRecordId, workDate));
        
        // Mock update correction (employeeId fix)
        prismaCorrectionUpdate.mockResolvedValue({});

        // Mock find context data
        prismaClockRecordFindMany.mockResolvedValue([]);
        prismaCorrectionFindMany.mockResolvedValue([
          { type: CorrectionType.check_out, correctionTime: new Date(dto.checkOutTime) }
        ]);
        prismaLeaveFindMany.mockResolvedValue([]);

        // Mock update daily record
        prismaDailyRecordUpdate.mockImplementation(({ data }) => Promise.resolve({
          ...mockDailyRecord(dto.dailyRecordId, workDate),
          ...data,
          checkOutTime: new Date(dto.checkOutTime), // Expected update
        }));

        // Execute
        const result = await service.checkOut(dto, operatorId);

        // Verify
        expect(result.success).toBe(true);
        expect(prismaCorrectionCreate).toHaveBeenCalled();
        expect(prismaDailyRecordUpdate).toHaveBeenCalledWith(expect.objectContaining({
          where: { id: recordId },
          data: expect.objectContaining({
            checkOutTime: new Date(dto.checkOutTime)
          })
        }));
      })
    );
  });
});
