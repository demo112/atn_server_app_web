import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttendanceSettingsService } from './attendance-settings.service';
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

describe('AttendanceSettingsService', () => {
  let service: AttendanceSettingsService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new AttendanceSettingsService();
  });

  describe('getSettings', () => {
    it('should return settings as object', async () => {
      mockPrisma.attSetting.findMany.mockResolvedValue([
        { id: 1, key: 'day_switch_time', value: '06:00', description: '', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, key: 'auto_calc_time', value: '02:00', description: '', createdAt: new Date(), updatedAt: new Date() }
      ]);

      const result = await service.getSettings();
      expect(result.day_switch_time).toBe('06:00');
      expect(result.auto_calc_time).toBe('02:00');
    });

    it('should use default value if setting not found', async () => {
      mockPrisma.attSetting.findMany.mockResolvedValue([]);
      const result = await service.getSettings();
      expect(result.day_switch_time).toBe('05:00');
      expect(result.auto_calc_time).toBe('05:00');
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      mockPrisma.attSetting.upsert.mockResolvedValue({} as any);
      // Mock findMany called in getSettings
      mockPrisma.attSetting.findMany.mockResolvedValue([
        { id: 1, key: 'day_switch_time', value: '07:00', description: '', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, key: 'auto_calc_time', value: '03:00', description: '', createdAt: new Date(), updatedAt: new Date() }
      ]);

      const result = await service.updateSettings({ day_switch_time: '07:00', auto_calc_time: '03:00' });
      expect(result.day_switch_time).toBe('07:00');
      expect(result.auto_calc_time).toBe('03:00');
      expect(mockPrisma.attSetting.upsert).toHaveBeenCalledTimes(2);
    });

    it('should throw error for invalid time format', async () => {
      await expect(service.updateSettings({ day_switch_time: '25:00' }))
        .rejects.toThrow('Invalid time format for day_switch_time');
        
      await expect(service.updateSettings({ auto_calc_time: 'invalid' }))
        .rejects.toThrow('Invalid time format for auto_calc_time');
    });
  });

  describe('initDefaults', () => {
    it('should create defaults if not exist', async () => {
      mockPrisma.attSetting.findUnique.mockResolvedValue(null);
      await service.initDefaults();
      expect(mockPrisma.attSetting.create).toHaveBeenCalled();
    });

    it('should not create if exists', async () => {
      mockPrisma.attSetting.findUnique.mockResolvedValue({ id: 1 } as any);
      await service.initDefaults();
      expect(mockPrisma.attSetting.create).not.toHaveBeenCalled();
    });
  });
});
