
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { LeaveService } from './leave.service';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';
import { LeaveType } from '@prisma/client';

// Define mock functions outside to ensure they are the same references
const findUniqueEmployee = vi.fn();
const findFirstLeave = vi.fn();
const createLeave = vi.fn();

vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findUnique: (...args: any[]) => findUniqueEmployee(...args),
    },
    attLeave: {
      findFirst: (...args: any[]) => findFirstLeave(...args),
      create: (...args: any[]) => createLeave(...args),
    },
  },
}));

describe('LeaveService PBT', () => {
  let service: LeaveService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LeaveService();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  const createLeaveDtoArb = fc.record({
    employeeId: fc.integer({ min: 1 }),
    type: fc.constantFrom('annual', 'sick', 'personal', 'business_trip') as fc.Arbitrary<LeaveType>,
    startTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    endTime: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    reason: fc.string(),
    operatorId: fc.integer({ min: 1 }),
  });

  it('should throw ERR_LEAVE_INVALID_TIME if startTime >= endTime', () => {
    return fc.assert(
      fc.asyncProperty(createLeaveDtoArb, async (dto) => {
        // Mock employee exists
        findUniqueEmployee.mockResolvedValue({ id: dto.employeeId });

        // Force invalid time
        const invalidDto = { ...dto, endTime: dto.startTime };
        
        await expect(service.create(invalidDto)).rejects.toThrow(/Start time must be before end time/);
        
        const invalidDto2 = { ...dto, startTime: new Date(dto.endTime.getTime() + 1000) };
        await expect(service.create(invalidDto2)).rejects.toThrow(/Start time must be before end time/);
      })
    );
  });

  it('should successfully create leave if no overlap and employee exists', () => {
    return fc.assert(
      fc.asyncProperty(createLeaveDtoArb, async (dto) => {
        fc.pre(dto.startTime < dto.endTime);

        // Explicitly set mocks for this iteration
        findUniqueEmployee.mockResolvedValue({ id: dto.employeeId });
        findFirstLeave.mockResolvedValue(null); // No overlap
        createLeave.mockResolvedValue({
          id: 1,
          ...dto,
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
          employee: { department: { name: 'Dept' } },
          approver: null
        });

        const result = await service.create(dto);

        expect(result).toBeDefined();
        expect(result.employeeId).toBe(dto.employeeId);
        expect(findFirstLeave).toHaveBeenCalled();
        expect(createLeave).toHaveBeenCalled();
      }),
      { numRuns: 50 } 
    );
  });

  it('should throw ERR_LEAVE_TIME_OVERLAP if overlap exists', () => {
    return fc.assert(
      fc.asyncProperty(createLeaveDtoArb, async (dto) => {
        fc.pre(dto.startTime < dto.endTime);

        findUniqueEmployee.mockResolvedValue({ id: dto.employeeId });
        // Mock overlap found
        findFirstLeave.mockResolvedValue({ id: 999 });

        await expect(service.create(dto)).rejects.toThrow(/Leave time overlaps/);
        
        // Ensure create was NOT called
        expect(createLeave).not.toHaveBeenCalled();
      }),
      { numRuns: 50 }
    );
  });

  it('should throw ERR_EMPLOYEE_NOT_FOUND if employee does not exist', () => {
    return fc.assert(
      fc.asyncProperty(createLeaveDtoArb, async (dto) => {
        fc.pre(dto.startTime < dto.endTime);

        findUniqueEmployee.mockResolvedValue(null);

        await expect(service.create(dto)).rejects.toThrow(/Employee not found/);
      }),
      { numRuns: 50 }
    );
  });
});
