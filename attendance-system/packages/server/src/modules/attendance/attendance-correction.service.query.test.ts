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

  it('should not filter by status when status is undefined (all records)', async () => {
    // Setup
    mockPrisma.attDailyRecord.count.mockResolvedValue(0);
    mockPrisma.attDailyRecord.findMany.mockResolvedValue([]);

    // Execute
    await service.getDailyRecords({ status: undefined } as any);

    // Verify
    expect(mockPrisma.attDailyRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({
          status: expect.anything()
        })
      })
    );
  });

  it('should filter by normal status when status is "normal"', async () => {
    // Setup
    mockPrisma.attDailyRecord.count.mockResolvedValue(0);
    mockPrisma.attDailyRecord.findMany.mockResolvedValue([]);

    // Execute
    await service.getDailyRecords({ status: 'normal' } as any);

    // Verify
    expect(mockPrisma.attDailyRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'normal'
        })
      })
    );
  });

  it('should ignore invalid deptId', async () => {
    // Setup
    mockPrisma.attDailyRecord.count.mockResolvedValue(0);
    mockPrisma.attDailyRecord.findMany.mockResolvedValue([]);

    // Execute
    await service.getDailyRecords({ deptId: 'invalid' } as any);

    // Verify
    // Should not have deptId in where clause or should not be NaN
    const callArgs = mockPrisma.attDailyRecord.findMany.mock.calls[0][0];
    const whereArg = callArgs?.where;
    const employeeArg = whereArg?.employee;
    
    // If it was added as NaN, this expectation might fail if we expect it to be undefined
    // Or we can explicitly check it is undefined
    if (employeeArg) {
       expect(employeeArg.deptId).toBeUndefined();
    } else {
       expect(employeeArg).toBeUndefined();
    }
  });
});
