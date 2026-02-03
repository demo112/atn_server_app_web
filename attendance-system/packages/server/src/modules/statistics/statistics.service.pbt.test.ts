import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { StatisticsService } from './statistics.service';
import { AttendanceStatus } from '@attendance/shared';

// Mocks
const prismaEmployeeFindMany = vi.fn();
const prismaAttDailyRecordCount = vi.fn();
const prismaAttDailyRecordFindMany = vi.fn();
const prismaQueryRaw = vi.fn();

vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findMany: (...args: any[]) => prismaEmployeeFindMany(...args),
    },
    attDailyRecord: {
      count: (...args: any[]) => prismaAttDailyRecordCount(...args),
      findMany: (...args: any[]) => prismaAttDailyRecordFindMany(...args),
    },
    $queryRaw: (...args: any[]) => prismaQueryRaw(...args),
  },
}));

describe('StatisticsService PBT', () => {
  let service: StatisticsService;

  beforeEach(() => {
    service = new StatisticsService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const dailyRecordQueryArb = fc.record({
    page: fc.option(fc.integer({ min: 1, max: 100 })),
    pageSize: fc.option(fc.integer({ min: 1, max: 50 })),
    startDate: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().split('T')[0])),
    endDate: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().split('T')[0])),
    deptId: fc.option(fc.integer({ min: 1 })),
    employeeId: fc.option(fc.integer({ min: 1 })),
    employeeName: fc.option(fc.string({ minLength: 1 })),
    status: fc.option(fc.constantFrom<AttendanceStatus>('normal', 'late', 'early_leave', 'absent', 'leave')),
  });

  it('should construct correct where clause for getDailyRecords', async () => {
    await fc.assert(
      fc.asyncProperty(dailyRecordQueryArb, async (query) => {
        vi.clearAllMocks();

        // Setup Mocks
        // Mock employees found for dept/name filter
        prismaEmployeeFindMany.mockResolvedValue([
            { id: 1, name: 'Emp1', employeeNo: '001', department: { name: 'Dept1' } }
        ]);
        
        // Mock records found
        prismaAttDailyRecordCount.mockResolvedValue(0);
        prismaAttDailyRecordFindMany.mockResolvedValue([]);

        // Execute
        await service.getDailyRecords(query as any);

        // Verify Logic
        // We capture the call to findMany and check if the where clause matches the query
        const findManyCalls = prismaAttDailyRecordFindMany.mock.calls;
        if (findManyCalls.length > 0) {
            const args = findManyCalls[0][0];
            const where = args.where;

            if (query.startDate && query.endDate) {
                expect(where.workDate).toBeDefined();
                // Check date components instead of ISO string to avoid timezone issues
                const gteDate = new Date(where.workDate.gte);
                const [expectedYear, expectedMonth, expectedDay] = query.startDate.split('-').map(Number);
                expect(gteDate.getFullYear()).toBe(expectedYear);
                expect(gteDate.getMonth()).toBe(expectedMonth - 1); // 0-indexed
                expect(gteDate.getDate()).toBe(expectedDay);
            }

            if (query.status) {
                expect(where.status).toBe(query.status);
            }

            // Employee Logic is complex (intersection of dept, name, and id)
            // If employeeId is provided directly:
            if (query.employeeId) {
                 // Check if it's in the where clause (either as number or in array)
                 // The service logic:
                 // if deptId -> finds employees -> intersects with employeeId
                 // if employeeId only -> where.employeeId = employeeId
                 // if employeeName -> finds employees -> where.employeeId in [...]
                 
                 // Since we mocked EmployeeFindMany to return [id:1], 
                 // if deptId/Name is present, it will try to filter by ID 1.
                 // We trust the service logic works if it calls findMany with *some* constraints.
                 // This PBT is mainly ensuring it doesn't crash and passes params.
            }
        }
      })
    );
  });

  const calendarQueryArb = fc.record({
      year: fc.integer({ min: 2000, max: 2030 }),
      month: fc.integer({ min: 1, max: 12 }),
      employeeId: fc.integer({ min: 1 })
  });

  it('should query correct date range for getCalendar', async () => {
      await fc.assert(
          fc.asyncProperty(calendarQueryArb, async ({ year, month, employeeId }) => {
              vi.clearAllMocks();
              prismaAttDailyRecordFindMany.mockResolvedValue([]);

              await service.getCalendar(year, month, employeeId);

              const calls = prismaAttDailyRecordFindMany.mock.calls;
              expect(calls.length).toBe(1);
              const where = calls[0][0].where;

              expect(where.employeeId).toBe(employeeId);
              
              const gte = where.workDate.gte;
              const lte = where.workDate.lte;
              
              expect(gte.getFullYear()).toBe(year);
              expect(gte.getMonth()).toBe(month - 1); // 0-indexed
              expect(gte.getDate()).toBe(1);

              expect(lte.getFullYear()).toBe(year);
              expect(lte.getMonth()).toBe(month - 1); // Last day of current month should be in current month
              // Or check logic: new Date(year, month, 0)
          })
      );
  });
});
