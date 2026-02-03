
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../common/db/prisma';
import { StatisticsService } from './statistics.service';
import { AttendanceStatus } from '@attendance/shared';

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

  describe('getDailyRecords', () => {
    it('should return paginated records', async () => {
      // Setup Mock Data
      const mockRecords = [
        {
          id: BigInt(1),
          employeeId: 1,
          workDate: new Date('2023-01-01'),
          status: 'normal',
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          absentMinutes: 0,
          leaveMinutes: 0,
          checkInTime: new Date('2023-01-01T09:00:00Z'),
          checkOutTime: new Date('2023-01-01T18:00:00Z'),
          shiftName: 'Day Shift'
        }
      ];

      const mockEmployees = [
        {
          id: 1,
          employeeNo: 'E001',
          name: 'Test User',
          department: { name: 'Test Dept' }
        }
      ];

      mockPrisma.attDailyRecord.findMany.mockResolvedValue(mockRecords as any);
      mockPrisma.attDailyRecord.count.mockResolvedValue(1);
      mockPrisma.employee.findMany.mockResolvedValue(mockEmployees as any);

      // Execute
      const result = await service.getDailyRecords({
        page: 1,
        pageSize: 10
      });

      // Verify
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe('1'); // BigInt -> String
      expect(result.items[0].employeeName).toBe('Test User');
      expect(result.items[0].deptName).toBe('Test Dept');
    });

    it('should filter by date range', async () => {
      mockPrisma.attDailyRecord.findMany.mockResolvedValue([]);
      mockPrisma.attDailyRecord.count.mockResolvedValue(0);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await service.getDailyRecords({
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      });

      expect(mockPrisma.attDailyRecord.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          workDate: expect.anything()
        })
      }));
    });
  });

  describe('getCalendar', () => {
    it('should return calendar data', async () => {
      const mockRecords = [
        {
          workDate: new Date('2023-01-01'),
          status: 'normal'
        },
        {
          workDate: new Date('2023-01-02'),
          status: 'late'
        }
      ];

      mockPrisma.attDailyRecord.findMany.mockResolvedValue(mockRecords as any);

      const result = await service.getCalendar(2023, 1, 1);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2023-01-01');
      expect(result[0].status).toBe('normal');
      expect(result[0].isAbnormal).toBe(false);
      expect(result[1].isAbnormal).toBe(true);
    });
  });

  describe('getDepartmentSummary', () => {
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
});
