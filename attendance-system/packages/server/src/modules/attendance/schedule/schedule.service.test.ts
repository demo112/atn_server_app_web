import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScheduleService } from './schedule.service';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

describe('ScheduleService', () => {
  let service: ScheduleService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new ScheduleService();
    
    // Mock transaction to execute callback immediately with mockPrisma
    mockPrisma.$transaction.mockImplementation(async (callback) => {
      return callback(mockPrisma);
    });

    // Mock employee and shift check
    mockPrisma.employee.findUnique.mockResolvedValue({ id: 1 } as any);
    mockPrisma.attShift.findUnique.mockResolvedValue({ id: 1 } as any);
  });

  describe('create', () => {
    it('should create schedule when no conflict', async () => {
      mockPrisma.attSchedule.findMany.mockResolvedValue([]);
      
      const createdSchedule = {
        id: 1,
        employeeId: 1,
        shiftId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        createdAt: new Date(),
        updatedAt: new Date(),
        shift: { name: 'Morning' },
        employee: { name: 'John' }
      };

      mockPrisma.attSchedule.create.mockResolvedValue(createdSchedule as any);
      mockPrisma.attSchedule.findFirst.mockResolvedValue(createdSchedule as any);

      const result = await service.create({
        employeeId: 1,
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
      });

      expect(result.id).toBe(1);
      expect(mockPrisma.attSchedule.create).toHaveBeenCalled();
    });

    it('should throw error when conflict exists and force=false', async () => {
      mockPrisma.attSchedule.findMany.mockResolvedValue([{ id: 99 }] as any);

      await expect(service.create({
        employeeId: 1,
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        force: false,
      })).rejects.toThrow('Employee 1 has conflicts');
    });

    it('should resolve conflict when force=true (Obsolete)', async () => {
      // Existing: 2024-01-02 to 2024-01-03 (Inside new)
      // New: 2024-01-01 to 2024-01-05
      mockPrisma.attSchedule.findMany.mockResolvedValue([
        { id: 99, startDate: new Date('2024-01-02'), endDate: new Date('2024-01-03') } as any
      ]);
      
      const createdSchedule = {
        id: 1,
        employeeId: 1,
        shiftId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
      };
      
      mockPrisma.attSchedule.create.mockResolvedValue(createdSchedule as any);
      mockPrisma.attSchedule.findFirst.mockResolvedValue(createdSchedule as any);

      await service.create({
        employeeId: 1,
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        force: true,
      });

      // Should delete old
      expect(mockPrisma.attSchedule.delete).toHaveBeenCalledWith({ where: { id: 99 } });
      expect(mockPrisma.attSchedule.create).toHaveBeenCalled();
    });

    it('should resolve conflict when force=true (Trim Right)', async () => {
      // Existing: 2023-12-30 to 2024-01-02
      // New: 2024-01-01 to 2024-01-05
      // Overlap: 01-01 to 01-02
      // Old should become: 2023-12-30 to 2023-12-31
      mockPrisma.attSchedule.findMany.mockResolvedValue([
        { id: 99, startDate: new Date('2023-12-30'), endDate: new Date('2024-01-02') } as any
      ]);
      
      const createdSchedule = {
        id: 1,
        employeeId: 1,
        shiftId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
      };
      mockPrisma.attSchedule.create.mockResolvedValue(createdSchedule as any);
      mockPrisma.attSchedule.findFirst.mockResolvedValue(createdSchedule as any);

      await service.create({
        employeeId: 1,
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        force: true,
      });

      // Should update old.endDate to 2023-12-31
      const expectedEndDate = new Date('2023-12-31');
      expect(mockPrisma.attSchedule.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 99 },
        data: { endDate: expectedEndDate }
      }));
    });

    it('should resolve conflict when force=true (Trim Left)', async () => {
      // Existing: 2024-01-04 to 2024-01-08
      // New: 2024-01-01 to 2024-01-05
      // Overlap: 01-04 to 01-05
      // Old should become: 2024-01-06 to 2024-01-08
      mockPrisma.attSchedule.findMany.mockResolvedValue([
        { id: 99, startDate: new Date('2024-01-04'), endDate: new Date('2024-01-08') } as any
      ]);
      
      const createdSchedule = {
        id: 1,
        employeeId: 1,
        shiftId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
      };
      mockPrisma.attSchedule.create.mockResolvedValue(createdSchedule as any);
      mockPrisma.attSchedule.findFirst.mockResolvedValue(createdSchedule as any);

      await service.create({
        employeeId: 1,
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        force: true,
      });

      // Should update old.startDate to 2024-01-06
      const expectedStartDate = new Date('2024-01-06');
      expect(mockPrisma.attSchedule.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 99 },
        data: { startDate: expectedStartDate }
      }));
    });

    it('should resolve conflict when force=true (Split)', async () => {
      // Existing: 2023-12-30 to 2024-01-10
      // New: 2024-01-01 to 2024-01-05
      // Old should split into:
      // Left: 2023-12-30 to 2023-12-31
      // Right: 2024-01-06 to 2024-01-10
      mockPrisma.attSchedule.findMany.mockResolvedValue([
        { 
            id: 99, 
            employeeId: 1,
            shiftId: 1,
            startDate: new Date('2023-12-30'), 
            endDate: new Date('2024-01-10') 
        } as any
      ]);
      
      const createdSchedule = {
        id: 1,
        employeeId: 1,
        shiftId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
      };
      mockPrisma.attSchedule.create.mockResolvedValue(createdSchedule as any);
      mockPrisma.attSchedule.findFirst.mockResolvedValue(createdSchedule as any);

      await service.create({
        employeeId: 1,
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        force: true,
      });

      // 1. Update old to Left
      const expectedLeftEnd = new Date('2023-12-31');
      expect(mockPrisma.attSchedule.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 99 },
        data: { endDate: expectedLeftEnd }
      }));

      // 2. Create Right
      const expectedRightStart = new Date('2024-01-06');
      expect(mockPrisma.attSchedule.create).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          employeeId: 1,
          shiftId: 1,
          startDate: expectedRightStart,
          endDate: new Date('2024-01-10')
        }
      }));
    });
  });

  describe('batchCreate', () => {
    it('should create schedules for multiple employees', async () => {
      mockPrisma.department.findMany.mockResolvedValue([
        { id: 1, parentId: null },
        { id: 2, parentId: 1 }
      ] as any);

      mockPrisma.employee.findMany.mockResolvedValue([
        { id: 1 }, { id: 2 }
      ] as any);

      mockPrisma.attSchedule.findMany.mockResolvedValue([]);
      mockPrisma.attSchedule.create.mockResolvedValue({} as any);

      const result = await service.batchCreate({
        departmentIds: [1],
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        includeSubDepartments: true
      });

      expect(result.count).toBe(2);
      expect(mockPrisma.attSchedule.create).toHaveBeenCalledTimes(2);
    });

    it('should return count 0 if no employees found', async () => {
      mockPrisma.department.findMany.mockResolvedValue([]);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      const result = await service.batchCreate({
        departmentIds: [1],
        shiftId: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
      });

      expect(result.count).toBe(0);
      expect(mockPrisma.attSchedule.create).not.toHaveBeenCalled();
    });
  });
});
