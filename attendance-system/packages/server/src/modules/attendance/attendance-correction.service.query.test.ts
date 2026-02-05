import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceCorrectionService } from './attendance-correction.service';
import { prisma } from '../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

vi.mock('../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

describe('AttendanceCorrectionService Query', () => {
  let service: AttendanceCorrectionService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new AttendanceCorrectionService();
  });

  it('should filter by abnormal status when status is "abnormal"', async () => {
    // Setup
    mockPrisma.attDailyRecord.count.mockResolvedValue(0);
    mockPrisma.attDailyRecord.findMany.mockResolvedValue([]);

    // Execute
    await service.getDailyRecords({ status: 'abnormal' } as any);

    // Verify
    expect(mockPrisma.attDailyRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: {
            in: ['late', 'early_leave', 'absent']
          }
        })
      })
    );
  });

  it('should filter by specific status when status is "late"', async () => {
    // Setup
    mockPrisma.attDailyRecord.count.mockResolvedValue(0);
    mockPrisma.attDailyRecord.findMany.mockResolvedValue([]);

    // Execute
    await service.getDailyRecords({ status: 'late' } as any);

    // Verify
    expect(mockPrisma.attDailyRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'late'
        })
      })
    );
  });
});
