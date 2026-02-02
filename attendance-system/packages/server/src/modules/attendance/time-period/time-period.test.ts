
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TimePeriodService } from './time-period.service';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock prisma
vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

describe('TimePeriodService', () => {
  let service: TimePeriodService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new TimePeriodService();
  });

  describe('create', () => {
    it('should create a time period successfully', async () => {
      const dto = {
        name: 'Normal Shift',
        type: 0,
        startTime: '09:00',
        endTime: '18:00',
      };

      const createdEntity = {
        id: 1,
        ...dto,
        restStartTime: null,
        restEndTime: null,
        rules: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.attTimePeriod.findFirst.mockResolvedValue(null);
      mockPrisma.attTimePeriod.create.mockResolvedValue(createdEntity as any);

      const result = await service.create(dto);

      expect(result.id).toBe(1);
      expect(result.name).toBe(dto.name);
      expect(mockPrisma.attTimePeriod.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if name exists', async () => {
      const dto = { name: 'Existing', type: 0 };
      
      mockPrisma.attTimePeriod.findFirst.mockResolvedValue({ id: 1 } as any);

      await expect(service.create(dto)).rejects.toThrow('Time period name already exists');
    });
  });

  describe('update', () => {
    it('should update successfully', async () => {
      const id = 1;
      const dto = { name: 'Updated Name' };
      const existing = { id, name: 'Old Name' };
      const updated = { ...existing, ...dto, createdAt: new Date(), updatedAt: new Date() };

      mockPrisma.attTimePeriod.findUnique.mockResolvedValue(existing as any);
      mockPrisma.attTimePeriod.findFirst.mockResolvedValue(null);
      mockPrisma.attTimePeriod.update.mockResolvedValue(updated as any);

      const result = await service.update(id, dto);
      expect(result.name).toBe('Updated Name');
    });

    it('should throw if not found', async () => {
      mockPrisma.attTimePeriod.findUnique.mockResolvedValue(null);
      await expect(service.update(999, {})).rejects.toThrow('Time period not found');
    });
  });

  describe('remove', () => {
    it('should remove successfully if not in use', async () => {
      const id = 1;
      mockPrisma.attTimePeriod.findUnique.mockResolvedValue({ id, name: 'Test' } as any);
      mockPrisma.attShiftPeriod.count.mockResolvedValue(0);
      mockPrisma.attTimePeriod.delete.mockResolvedValue({ id } as any);

      await service.remove(id);
      expect(mockPrisma.attTimePeriod.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw if in use', async () => {
      const id = 1;
      mockPrisma.attTimePeriod.findUnique.mockResolvedValue({ id, name: 'Test' } as any);
      mockPrisma.attShiftPeriod.count.mockResolvedValue(1);

      await expect(service.remove(id)).rejects.toThrow('Time period is in use by shifts');
    });
  });
});
