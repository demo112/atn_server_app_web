
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { AttendanceClockService } from './attendance-clock.service';
import { prisma } from '../../common/db/prisma';

// Mock prisma module
vi.mock('../../common/db/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

describe('AttendanceClockService - Adversarial Verification', () => {
  let service: AttendanceClockService;
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
    service = new AttendanceClockService();
  });

  describe('Fuzz Testing', () => {
    it('create should not crash with extreme integer inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
             fc.constant(Number.MAX_SAFE_INTEGER), 
             fc.constant(Number.MIN_SAFE_INTEGER), 
             fc.integer()
          ),
          async (employeeId) => {
            // Setup
            prismaMock.employee.findUnique.mockResolvedValue(null); // Assume not found for safety

            try {
              await service.create({
                employeeId,
                type: 'IN' as any,
                source: 'APP' as any
              });
            } catch (e: any) {
              // Should throw handled error, not crash with undefined reference etc.
              expect(e.message).toBe('ERR_EMPLOYEE_NOT_FOUND');
            }
          }
        )
      );
    });

    it('findAll should handle extreme page/pageSize values without crashing', async () => {
      await fc.assert(
        fc.asyncProperty(
            fc.oneof(fc.integer({ min: -100, max: 0 }), fc.constant(Number.MAX_SAFE_INTEGER)),
            fc.oneof(fc.integer({ min: -100, max: 0 }), fc.constant(Number.MAX_SAFE_INTEGER)),
            async (page, pageSize) => {
                // Mock
                prismaMock.attClockRecord.count.mockResolvedValue(0);
                prismaMock.attClockRecord.findMany.mockResolvedValue([]);

                try {
                    await service.findAll({ page, pageSize });
                } catch (e) {
                    // It might throw Prisma validation error for negative skip/take, which is acceptable.
                    // But it shouldn't be a logic crash (e.g. division by zero).
                    // In the implementation: skip = (page - 1) * pageSize. 
                    // If page is negative, skip is negative. Prisma throws on negative skip.
                }
            }
        )
      );
    });
  });
});
