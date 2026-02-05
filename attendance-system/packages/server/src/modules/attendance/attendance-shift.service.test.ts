import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceShiftService } from './attendance-shift.service';
import { prisma } from '../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/errors';

// Mock prisma
vi.mock('../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

describe('AttendanceShiftService', () => {
  let service: AttendanceShiftService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new AttendanceShiftService();
  });

  const mockShift = {
    id: 1,
    name: 'Day Shift',
    cycleDays: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
    periods: [] as any
  };

  describe('create', () => {
    it('should create shift successfully', async () => {
      mockPrisma.attShift.findFirst.mockResolvedValue(null);
      mockPrisma.attShift.create.mockResolvedValue(mockShift as any);

      const dto = {
        name: 'Day Shift',
        cycleDays: 7,
        days: [{ dayIndex: 1, periodId: 1 }]
      };

      const result = await service.create(dto);
      expect(result.name).toBe('Day Shift');
      expect(mockPrisma.attShift.create).toHaveBeenCalled();
    });

    it('should throw error if name exists', async () => {
      mockPrisma.attShift.findFirst.mockResolvedValue(mockShift as any);
      
      const dto = {
        name: 'Day Shift',
        days: []
      };

      await expect(service.create(dto)).rejects.toThrow('Shift name already exists');
    });
  });

  describe('findAll', () => {
    it('should return paginated list of shifts', async () => {
      mockPrisma.attShift.count.mockResolvedValue(1);
      mockPrisma.attShift.findMany.mockResolvedValue([mockShift as any]);
      
      const result = await service.findAll();
      
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.attShift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10
        })
      );
    });

    it('should filter by name and paginate', async () => {
      mockPrisma.attShift.count.mockResolvedValue(0);
      mockPrisma.attShift.findMany.mockResolvedValue([]);
      
      await service.findAll('Night', 2, 20);
      
      expect(mockPrisma.attShift.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { name: { contains: 'Night' } } })
      );
      expect(mockPrisma.attShift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ 
          where: { name: { contains: 'Night' } },
          skip: 20,
          take: 20
        })
      );
    });
  });

  describe('findById', () => {
    it('should return shift details', async () => {
      mockPrisma.attShift.findUnique.mockResolvedValue(mockShift as any);
      const result = await service.findById(1);
      expect(result?.id).toBe(1);
    });

    it('should return null if not found', async () => {
      mockPrisma.attShift.findUnique.mockResolvedValue(null);
      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update shift successfully', async () => {
      // Mock update transaction
      mockPrisma.$transaction.mockImplementation(async (cb) => {
         if (typeof cb === 'function') return cb(mockPrisma);
         return cb;
      });
      mockPrisma.attShift.update.mockResolvedValue({ ...mockShift, name: 'New Name' } as any);

      // Mock findById: first call (check existence), second call (return result)
      mockPrisma.attShift.findUnique
        .mockResolvedValueOnce(mockShift as any) // check existence
        .mockResolvedValueOnce({ ...mockShift, name: 'New Name' } as any); // return result

      const dto = { name: 'New Name' };
      const result = await service.update(1, dto);
      expect(result.name).toBe('New Name');
    });

    it('should throw error if not found', async () => {
      mockPrisma.attShift.findUnique.mockResolvedValue(null);
      await expect(service.update(1, {})).rejects.toThrow('Shift not found');
    });
  });
});
