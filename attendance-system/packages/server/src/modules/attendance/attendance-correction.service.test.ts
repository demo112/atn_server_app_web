import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceCorrectionService } from './attendance-correction.service';
import { prisma } from '../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient, CorrectionType } from '@prisma/client';
import { AppError } from '../../common/errors';

vi.mock('../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

describe('AttendanceCorrectionService', () => {
  let service: AttendanceCorrectionService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new AttendanceCorrectionService();
  });

  const mockPeriod = {
    id: 1,
    name: 'Normal',
    startTime: '09:00',
    endTime: '18:00',
    rules: {} as any
  };

  const mockRecord = {
    id: BigInt(1),
    employeeId: 100,
    workDate: new Date('2024-02-01'),
    periodId: 1,
    period: mockPeriod,
    employee: { id: 100, name: 'John', department: { name: 'IT' } },
    shift: { name: 'Day' },
    checkInTime: null,
    checkOutTime: null,
    status: 'absent'
  };

  describe('checkIn', () => {
    it('should successfully check in and create correction', async () => {
      // Setup
      mockPrisma.attDailyRecord.findUnique.mockResolvedValue(mockRecord as any);
      
      const updatedRecord = { ...mockRecord, checkInTime: new Date('2024-02-01T09:00:00Z'), status: 'normal' };
      const correctionLog = { id: 1, type: CorrectionType.check_in };

      mockPrisma.$transaction.mockResolvedValue([updatedRecord, correctionLog] as any);

      // Execute
      const dto = { dailyRecordId: '1', checkInTime: '2024-02-01T09:00:00Z', remark: 'Forgot' };
      const result = await service.checkIn(dto, 999);

      // Verify
      expect(result.success).toBe(true);
      expect(result.dailyRecord.checkInTime).toBe('2024-02-01T09:00:00.000Z');
      expect(mockPrisma.attDailyRecord.update).toHaveBeenCalled();
      expect(mockPrisma.attCorrection.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          dailyRecordId: BigInt(1),
          type: CorrectionType.check_in,
          remark: 'Forgot'
        })
      }));
    });

    it('should throw error if record not found', async () => {
      mockPrisma.attDailyRecord.findUnique.mockResolvedValue(null);
      
      const dto = { dailyRecordId: '1', checkInTime: '2024-02-01T09:00:00Z' };
      await expect(service.checkIn(dto, 999)).rejects.toThrow('Daily record not found');
    });

    it('should throw error if period not found', async () => {
      mockPrisma.attDailyRecord.findUnique.mockResolvedValue({ ...mockRecord, period: null } as any);
      
      const dto = { dailyRecordId: '1', checkInTime: '2024-02-01T09:00:00Z' };
      await expect(service.checkIn(dto, 999)).rejects.toThrow('Time period not found');
    });
  });

  describe('checkOut', () => {
    it('should successfully check out', async () => {
      mockPrisma.attDailyRecord.findUnique.mockResolvedValue(mockRecord as any);
      
      const updatedRecord = { ...mockRecord, checkOutTime: new Date('2024-02-01T18:00:00Z'), status: 'normal' };
      mockPrisma.$transaction.mockResolvedValue([updatedRecord, {}] as any);

      const dto = { dailyRecordId: '1', checkOutTime: '2024-02-01T18:00:00Z' };
      const result = await service.checkOut(dto, 999);

      expect(result.success).toBe(true);
      expect(mockPrisma.attCorrection.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          type: CorrectionType.check_out
        })
      }));
    });
  });

  describe('getDailyRecords', () => {
    it('should return mapped records', async () => {
      const records = [mockRecord];
      mockPrisma.attDailyRecord.findMany.mockResolvedValue(records as any);
      mockPrisma.attDailyRecord.count.mockResolvedValue(1);

      const result = await service.getDailyRecords({ page: 1, pageSize: 10 });
      
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe('1');
      expect(result.items[0].employeeName).toBe('John');
    });
  });
});
