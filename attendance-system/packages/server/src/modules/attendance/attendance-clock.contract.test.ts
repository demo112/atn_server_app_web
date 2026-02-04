
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient, ClockType, ClockSource } from '@prisma/client';
import { AttendanceClockService } from './attendance-clock.service';
import { prisma } from '../../common/db/prisma';

// Mock prisma module
vi.mock('../../common/db/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

describe('AttendanceClockService - Contract Verification', () => {
  let service: AttendanceClockService;
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
    service = new AttendanceClockService();
    
    // Mock transaction to execute callback immediately using prismaMock as tx
    prismaMock.$transaction.mockImplementation(async (cb) => {
      return cb(prismaMock);
    });
    
    // Mock $queryRaw for locking
    prismaMock.$queryRaw.mockResolvedValue([]);
  });

  describe('create (打卡)', () => {
    it('契约: 有效输入应成功创建记录并返回一致的数据', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1 }), // employeeId
          fc.constantFrom(...Object.values(ClockType)), // type
          fc.constantFrom(...Object.values(ClockSource)), // source
          fc.date({ min: new Date('2020-01-01'), max: new Date() }), // clockTime (past or now)
          async (employeeId, type, source, clockTime) => {
            if (isNaN(clockTime.getTime())) return; // Skip invalid dates
            
            // Setup Mocks
            prismaMock.employee.findUnique.mockResolvedValue({ id: employeeId } as any);
            prismaMock.attClockRecord.findFirst.mockResolvedValue(null); // No recent clock
            prismaMock.attClockRecord.create.mockResolvedValue({
              id: BigInt(123),
              employeeId,
              clockTime,
              type,
              source,
              deviceInfo: null,
              location: null,
              operatorId: null,
              remark: null,
              createdAt: new Date(),
            } as any);

            // Execute
            const result = await service.create({
              employeeId,
              type,
              source,
              clockTime: clockTime.toISOString()
            });

            // Verify Contract
            expect(result.employeeId).toBe(employeeId);
            expect(result.type).toBe(type);
            expect(result.source).toBe(source);
            expect(new Date(result.clockTime).getTime()).toBe(clockTime.getTime());
          }
        )
      );
    });

    it('契约: 不存在的员工应抛出 ERR_EMPLOYEE_NOT_FOUND', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1 }),
          async (employeeId) => {
            // Setup Mock: Employee not found
            prismaMock.attClockRecord.findFirst.mockResolvedValue(null);
            prismaMock.employee.findUnique.mockResolvedValue(null);

            // Execute & Verify
            await expect(service.create({
              employeeId,
              type: 'sign_in' as any, // Hardcode to avoid enum issues
              source: 'app' as any
            })).rejects.toThrow('Employee not found');
          }
        )
      );
    });
    it('契约: 未来时间打卡应抛出 ERR_CLOCK_FUTURE_TIME_NOT_ALLOWED', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.date({ min: new Date(Date.now() + 61 * 1000) }), // Future date > 1 min
          async (futureDate) => {
              if (isNaN(futureDate.getTime())) return;
              await expect(service.create({
                 employeeId: 1,
                 type: 'sign_in' as any,
                 source: 'app' as any,
                 clockTime: futureDate.toISOString()
              })).rejects.toThrow('Future clock time not allowed');
           }
        )
      );
    });

    it('契约: 1分钟内重复打卡应抛出 ERR_CLOCK_TOO_FREQUENT', async () => {
       // Mock recent clock exists
       prismaMock.attClockRecord.findFirst.mockResolvedValue({ id: BigInt(1) } as any);
       
       await expect(service.create({
          employeeId: 1,
          type: 'sign_in' as any,
          source: 'app' as any
       })).rejects.toThrow('Clock in too frequent');
    });

  });

  describe('findAll (查询)', () => {
    it('契约: 分页查询返回的 items 数量不应超过 pageSize', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }), // pageSize
          fc.integer({ min: 0, max: 200 }), // total items in db
          async (pageSize, totalItems) => {
             // Mock count
             prismaMock.attClockRecord.count.mockResolvedValue(totalItems);
             
             // Mock findMany return mocked items
             const mockItems = Array(Math.min(pageSize, totalItems)).fill(null).map((_, i) => ({
                id: BigInt(i),
                employeeId: 1,
                clockTime: new Date(),
                type: ClockType.sign_in,
                source: ClockSource.app,
                deviceInfo: null,
                location: null,
                operatorId: null,
                remark: null,
                createdAt: new Date(),
             }));
             prismaMock.attClockRecord.findMany.mockResolvedValue(mockItems as any);

             // Execute
             const result = await service.findAll({ page: 1, pageSize });

             // Verify
             expect(result.items.length).toBeLessThanOrEqual(pageSize);
             if (totalItems > 0 && totalItems < pageSize) {
                expect(result.items.length).toBe(totalItems);
             }
          }
        )
      );
    });
  });
});
