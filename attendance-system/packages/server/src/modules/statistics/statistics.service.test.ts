
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../common/db/prisma';
import { StatisticsService } from './statistics.service';

vi.mock('../../common/db/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

describe('StatisticsService', () => {
  let service: StatisticsService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new StatisticsService();
  });

  it('should calculate summary correctly', async () => {
    // Setup Mock Data
    const startDate = '2023-01-01';
    const endDate = '2023-01-31';
    
    // Mock Employee
    mockPrisma.employee.findMany.mockResolvedValue([
      {
        id: 1,
        employeeNo: 'E001',
        name: 'Test User',
        deptId: 1,
        status: 'active',
        department: { id: 1, name: 'Test Dept' }
      } as any
    ]);

    // Mock Daily Records
    // 1 day late, 1 day normal
    mockPrisma.attDailyRecord.findMany.mockResolvedValue([
      {
        employeeId: 1,
        workDate: new Date('2023-01-01'),
        status: 'late',
        lateMinutes: 10,
        actualMinutes: 470,
        effectiveMinutes: 470,
      } as any,
      {
        employeeId: 1,
        workDate: new Date('2023-01-02'),
        status: 'normal',
        actualMinutes: 480,
        effectiveMinutes: 480,
      } as any
    ]);

    // Mock Leaves
    // 1 hour leave
    mockPrisma.attLeave.findMany.mockResolvedValue([
      {
        employeeId: 1,
        status: 'approved',
        startTime: new Date('2023-01-03T09:00:00'),
        endTime: new Date('2023-01-03T10:00:00'),
      } as any
    ]);

    // Execute
    const result = await service.getDepartmentSummary({
      startDate,
      endDate,
      deptId: 1
    });

    // Verify
    expect(result).toHaveLength(1);
    const summary = result[0];
    
    expect(summary.employeeId).toBe(1);
    expect(summary.totalDays).toBe(2); // 2 daily records
    expect(summary.actualDays).toBe(2); // no absent
    expect(summary.lateCount).toBe(1);
    expect(summary.lateMinutes).toBe(10);
    expect(summary.leaveCount).toBe(1);
    expect(summary.leaveMinutes).toBe(60);
    expect(summary.actualMinutes).toBe(950); // 470 + 480
  });
});
