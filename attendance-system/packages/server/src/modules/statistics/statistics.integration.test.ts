import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatisticsService } from './statistics.service';
import { prisma } from '../../common/db/prisma';
import { GetSummaryDto } from '@attendance/shared';

// Mock prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

// Mock exceljs to avoid dependency issues during test if not installed
vi.mock('exceljs', () => {
  return {
    Workbook: vi.fn().mockImplementation(() => ({
      addWorksheet: vi.fn().mockReturnValue({
        columns: [],
        addRows: vi.fn(),
      }),
      xlsx: {
        writeBuffer: vi.fn().mockResolvedValue(Buffer.from('PK...'))
      },
    })),
  };
});

describe('Statistics Integration Test (SW70)', () => {
  let service: StatisticsService;

  beforeEach(() => {
    service = new StatisticsService();
    vi.clearAllMocks();
  });

  describe('Story 1: 查看部门考勤汇总', () => {
    it('AC1/AC2: Should filter by deptId and date range', async () => {
      // Mock Data
      const mockEmployees = [
        { id: 1, name: 'Alice', employeeNo: 'E001', deptId: 1, department: { name: 'Tech' } },
      ];
      const mockAggregations = [
        {
          employee_id: 1,
          total_days: 20n, // Prisma returns BigInt for count
          actual_days: 18n,
          late_count: 1n,
          late_minutes: 15n,
          early_leave_count: 0n,
          early_leave_minutes: 0n,
          absent_count: 1n,
          absent_minutes: 0n,
          leave_count: 1n,
          leave_minutes: 480n,
        },
      ];

      (prisma.employee.findMany as any).mockResolvedValue(mockEmployees);
      (prisma.$queryRaw as any).mockResolvedValue(mockAggregations);

      const dto: GetSummaryDto = {
        startDate: '2023-10-01',
        endDate: '2023-10-31',
        deptId: 1,
      };

      const result = await service.getDepartmentSummary(dto);

      expect(prisma.employee.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ deptId: 1, status: 'active' }),
      }));
      
      expect(prisma.$queryRaw).toHaveBeenCalled();
      
      // AC4: Verify fields
      expect(result).toHaveLength(1);
      expect(result[0].employeeName).toBe('Alice');
      expect(result[0].totalDays).toBe(20);
      expect(result[0].lateMinutes).toBe(15);
      expect(result[0].leaveMinutes).toBe(480);
    });
  });

  describe('Story 3: 导出考勤汇总', () => {
    it('AC1/AC2: Should generate Excel buffer', async () => {
      // Setup mock data same as above
      const mockEmployees = [
        { id: 1, name: 'Alice', employeeNo: 'E001', deptId: 1, department: { name: 'Tech' } },
      ];
      const mockAggregations = [
        {
          employee_id: 1,
          total_days: 20n,
          actual_days: 18n,
          late_count: 1n,
          late_minutes: 15n,
          early_leave_count: 0n,
          early_leave_minutes: 0n,
          absent_count: 1n,
          absent_minutes: 0n,
          leave_count: 1n,
          leave_minutes: 480n,
        },
      ];
      (prisma.employee.findMany as any).mockResolvedValue(mockEmployees);
      (prisma.$queryRaw as any).mockResolvedValue(mockAggregations);

      const dto: GetSummaryDto = {
        startDate: '2023-10-01',
        endDate: '2023-10-31',
      };

      const buffer = await service.exportDepartmentSummary(dto);
      
      expect(buffer).toBeInstanceOf(Buffer);
      // Verify magic bytes for zip (PK..) which xlsx uses
      // 'P' is 0x50, 'K' is 0x4B
      expect(buffer[0]).toBe(0x50);
      expect(buffer[1]).toBe(0x4B);
    });
  });
});
