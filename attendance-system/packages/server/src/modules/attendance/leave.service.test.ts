import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaveService } from './leave.service';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';
import { LeaveType, LeaveStatus } from '@prisma/client';
import dayjs from 'dayjs';

// Mock prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    attLeave: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      findUnique: vi.fn(),
    }
  }
}));

describe('LeaveService', () => {
  let service: LeaveService;

  beforeEach(() => {
    service = new LeaveService();
    vi.clearAllMocks();
  });

  describe('create', () => {
    const validDto = {
      employeeId: 1,
      type: LeaveType.annual,
      startTime: '2024-02-01T09:00:00Z',
      endTime: '2024-02-01T18:00:00Z',
      reason: 'Annual leave',
      approverId: 99,
      operatorId: 1
    };

    it('should create a leave record if no overlap', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({ id: 1 } as any);
      vi.mocked(prisma.attLeave.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.attLeave.create).mockResolvedValue({
        id: 1,
        ...validDto,
        startTime: new Date(validDto.startTime),
        endTime: new Date(validDto.endTime),
        status: LeaveStatus.approved,
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await service.create(validDto);
      expect(result.id).toBe(1);
      expect(prisma.attLeave.create).toHaveBeenCalled();
    });

    it('should throw error if end time is before start time', async () => {
      // Logic check happens before DB call usually, but let's see service impl.
      // If it checks employee first, we need to mock it.
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({ id: 1 } as any);
      
      await expect(service.create({
        ...validDto,
        startTime: '2024-02-01T18:00:00Z',
        endTime: '2024-02-01T09:00:00Z'
      })).rejects.toThrow(AppError);
    });

    it('should throw error if overlapping record exists', async () => {
      vi.mocked(prisma.employee.findUnique).mockResolvedValue({ id: 1 } as any);
      vi.mocked(prisma.attLeave.findFirst).mockResolvedValue({
        id: 2,
        employeeId: 1,
        type: LeaveType.sick,
        startTime: new Date('2024-02-01T08:00:00Z'),
        endTime: new Date('2024-02-01T10:00:00Z'),
        status: LeaveStatus.approved,
        reason: null,
        approverId: null,
        approvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await expect(service.create(validDto)).rejects.toThrow('Leave time overlaps with existing record');
    });
  });
});
