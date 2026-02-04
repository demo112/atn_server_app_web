
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceClockService } from './attendance-clock.service';
import { prisma } from '../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient, ClockType, ClockSource } from '@prisma/client';
import { AppError } from '../../common/errors';

// Mock prisma
vi.mock('../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

describe('AttendanceClockService', () => {
  let service: AttendanceClockService;
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
    service = new AttendanceClockService();
    // Default mock for transaction: just execute the callback
    prismaMock.$transaction.mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(prismaMock);
      }
      return callback; // For array of promises
    });
  });

  const validDto = {
    employeeId: 1,
    type: ClockType.sign_in,
    source: ClockSource.app,
    deviceInfo: {},
    location: {},
    operatorId: undefined,
    remark: undefined,
  };

  it('should prevent duplicate clocks within 1 minute', async () => {
    // Setup: Employee exists
    prismaMock.employee.findUnique.mockResolvedValue({ id: 1 } as any);
    
    // Setup: Last clock was 30 seconds ago
    prismaMock.attClockRecord.findFirst.mockResolvedValue({
      id: BigInt(1),
      clockTime: new Date(Date.now() - 30 * 1000),
    } as any);

    await expect(service.create(validDto))
      .rejects.toThrow('Clock in too frequent');
  });

  it('should use transaction and lock to prevent race conditions', async () => {
    // Setup: Employee exists
    prismaMock.employee.findUnique.mockResolvedValue({ id: 1 } as any);
    prismaMock.attClockRecord.findFirst.mockResolvedValue(null);
    prismaMock.attClockRecord.create.mockResolvedValue({
      id: BigInt(1),
      clockTime: new Date(),
      employee: {},
      operator: {}
    } as any);

    await service.create(validDto);

    // Verify transaction was used
    expect(prismaMock.$transaction).toHaveBeenCalled();
    
    // Verify locking query was executed
    // It is a tagged template call
    expect(prismaMock.$queryRaw).toHaveBeenCalled();
    // Verify content of the query roughly
    const calls = prismaMock.$queryRaw.mock.calls;
    const lockingCall = calls.find(args => {
      const strings = args[0] as unknown as string[]; // TemplateStringsArray
      return strings.join('').includes('SELECT 1 FROM Employee') && 
             strings.join('').includes('FOR UPDATE');
    });
    expect(lockingCall).toBeDefined();
  });
});
