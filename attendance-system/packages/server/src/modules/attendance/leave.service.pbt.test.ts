
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { LeaveService } from './leave.service';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';
import { LeaveType, LeaveStatus } from '@prisma/client';

// Mock prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findUnique: vi.fn(),
    },
    attLeave: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('LeaveService PBT', () => {
  let service: LeaveService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LeaveService();
  });

  // Generator for CreateLeaveDto
  const createLeaveDtoArb = fc.record({
    employeeId: fc.integer({ min: 1 }),
    type: fc.constantFrom('annual', 'sick', 'personal', 'business_trip') as fc.Arbitrary<LeaveType>,
    startTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    endTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    reason: fc.string(),
    operatorId: fc.integer({ min: 1 }),
  });

  it('should throw ERR_LEAVE_INVALID_TIME if startTime >= endTime', () => {
    fc.assert(
      fc.property(createLeaveDtoArb, async (dto) => {
        // Force invalid time
        const invalidDto = { ...dto, endTime: dto.startTime };
        
        await expect(service.create(invalidDto)).rejects.toThrow('ERR_LEAVE_INVALID_TIME');
        
        const invalidDto2 = { ...dto, startTime: new Date(dto.endTime.getTime() + 1000) };
        await expect(service.create(invalidDto2)).rejects.toThrow('ERR_LEAVE_INVALID_TIME');
      })
    );
  });

  it('should successfully create leave if no overlap and employee exists', () => {
    fc.assert(
      fc.asyncProperty(createLeaveDtoArb, async (dto) => {
        fc.pre(dto.startTime < dto.endTime);

        // Mock behaviors
        vi.mocked(prisma.employee.findUnique).mockResolvedValue({ id: dto.employeeId } as any);
        vi.mocked(prisma.attLeave.findFirst).mockResolvedValue(null); // No overlap
        vi.mocked(prisma.attLeave.create).mockImplementation(async (args) => ({
          id: 1,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any));

        const result = await service.create(dto);

        expect(result).toBeDefined();
        expect(result.employeeId).toBe(dto.employeeId);
        expect(result.startTime).toEqual(dto.startTime);
        expect(result.endTime).toEqual(dto.endTime);
        
        // Verify dependencies called
        expect(prisma.attLeave.findFirst).toHaveBeenCalled();
        expect(prisma.attLeave.create).toHaveBeenCalled();
      })
    );
  });

  it('should throw ERR_LEAVE_TIME_OVERLAP if overlap exists', () => {
    fc.assert(
      fc.asyncProperty(createLeaveDtoArb, async (dto) => {
        fc.pre(dto.startTime < dto.endTime);

        // Mock behaviors
        vi.mocked(prisma.employee.findUnique).mockResolvedValue({ id: dto.employeeId } as any);
        // Mock overlap found
        vi.mocked(prisma.attLeave.findFirst).mockResolvedValue({ id: 999 } as any);

        await expect(service.create(dto)).rejects.toThrow('ERR_LEAVE_TIME_OVERLAP');
        
        expect(prisma.attLeave.create).not.toHaveBeenCalled();
      })
    );
  });

  it('should throw ERR_EMPLOYEE_NOT_FOUND if employee does not exist', () => {
    fc.assert(
      fc.asyncProperty(createLeaveDtoArb, async (dto) => {
        fc.pre(dto.startTime < dto.endTime);

        vi.mocked(prisma.employee.findUnique).mockResolvedValue(null);

        await expect(service.create(dto)).rejects.toThrow('ERR_EMPLOYEE_NOT_FOUND');
      })
    );
  });
});
