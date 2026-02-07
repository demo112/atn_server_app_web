
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceScheduler } from './attendance-scheduler';
import { prisma } from '../../common/db/prisma';

// Mock dependencies
vi.mock('bullmq');
vi.mock('ioredis');
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
    },
  },
}));
vi.mock('./attendance-settings.service');

describe('AttendanceScheduler', () => {
  let scheduler: AttendanceScheduler;

  beforeEach(() => {
    scheduler = new AttendanceScheduler();
    // Bypass init for unit testing triggerCalculation logic only
    // Set useInMemory to true to avoid queue checks and enable fallback logic
    (scheduler as any).useInMemory = true;
    
    // Mock runInMemoryCalculation to avoid actual calculation logic and errors
    vi.spyOn(scheduler as any, 'runInMemoryCalculation').mockImplementation(async () => {});
    
    vi.clearAllMocks();
  });

  describe('triggerCalculation', () => {
    it('should filter by deptName', async () => {
      (prisma.employee.findMany as any).mockResolvedValue([{ id: 1 }]);

      await scheduler.triggerCalculation({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        deptName: 'Engineering'
      });

      expect(prisma.employee.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          department: {
            name: { contains: 'Engineering' }
          }
        })
      }));
    });

    it('should filter by employeeName', async () => {
        (prisma.employee.findMany as any).mockResolvedValue([{ id: 1 }]);
  
        await scheduler.triggerCalculation({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          employeeName: 'John'
        });
  
        expect(prisma.employee.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'John' }
          })
        }));
      });

      it('should filter by deptId', async () => {
        (prisma.employee.findMany as any).mockResolvedValue([{ id: 1 }]);
  
        await scheduler.triggerCalculation({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          deptId: 123
        });
  
        expect(prisma.employee.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: expect.objectContaining({
            deptId: 123
          })
        }));
      });
  });
});
