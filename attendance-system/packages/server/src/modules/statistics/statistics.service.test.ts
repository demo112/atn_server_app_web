
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

    // Mock Daily Records Aggregation (queryRaw)
    mockPrisma.$queryRaw.mockResolvedValue([
      {
        employee_id: 1,
        total_days: 2,
        actual_days: 2,
        late_count: 1,
        late_minutes: 10,
        early_leave_count: 0,
        early_leave_minutes: 0,
        absent_count: 0,
        absent_minutes: 0,
        leave_count: 1,
        leave_minutes: 60,
      }
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
    expect(summary.totalDays).toBe(2); 
    expect(summary.actualDays).toBe(2);
    expect(summary.lateCount).toBe(1);
    expect(summary.lateMinutes).toBe(10);
    expect(summary.leaveCount).toBe(1);
    expect(summary.leaveMinutes).toBe(60);
  });
});
