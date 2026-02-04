
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatisticsService } from './statistics.service';
import { prisma } from '../../common/db/prisma';
import { GetSummaryDto, GetDeptStatsDto, GetChartStatsDto, DailyRecordQuery } from '@attendance/shared';

// Mock prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findMany: vi.fn(),
    },
    attDailyRecord: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

// Mock exceljs to avoid dependency issues during test if not installed
vi.mock('exceljs', () => {
  class Workbook {
    addWorksheet() {
      return {
        columns: [],
        addRows: vi.fn(),
      };
    }
    get xlsx() {
      return {
        writeBuffer: vi.fn().mockResolvedValue(Buffer.from([0x50, 0x4B, 0x03, 0x04]))
      };
    }
  }
  return {
    Workbook,
    default: { Workbook }
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
          missing_count: 1n,
          leave_count: 1n,
          leave_minutes: 480n,
        },
      ];
      
      const mockDailyRecords = [
         { employeeId: 1, workDate: new Date('2023-10-01'), status: 'normal' },
      ];

      (prisma.employee.findMany as any).mockResolvedValue(mockEmployees);
      (prisma.$queryRaw as any).mockResolvedValue(mockAggregations);
      (prisma.attDailyRecord.findMany as any).mockResolvedValue(mockDailyRecords);

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
      expect(result[0].missingCount).toBe(1);
    });
    
    it('Should filter by employeeName and deptName', async () => {
        // Mock Data
        const mockEmployees = [
          { id: 1, name: 'Bob', employeeNo: 'E002', deptId: 1, department: { name: 'Tech' } },
        ];
        
        (prisma.employee.findMany as any).mockResolvedValue(mockEmployees);
        (prisma.$queryRaw as any).mockResolvedValue([]);
        (prisma.attDailyRecord.findMany as any).mockResolvedValue([]);
  
        const dto: GetSummaryDto = {
          startDate: '2023-10-01',
          endDate: '2023-10-31',
          employeeName: 'Bob',
          deptName: 'Tech'
        };
  
        await service.getDepartmentSummary(dto);
  
        expect(prisma.employee.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: expect.objectContaining({ 
            name: { contains: 'Bob' },
            department: { name: { contains: 'Tech' } }
          }),
        }));
      });
  });

  describe('Story 3: 导出考勤汇总', () => {
    it('AC1/AC2: Should generate Excel buffer via exportDepartmentSummary', async () => {
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
          missing_count: 0n,
          leave_count: 1n,
          leave_minutes: 480n,
        },
      ];
      (prisma.employee.findMany as any).mockResolvedValue(mockEmployees);
      (prisma.$queryRaw as any).mockResolvedValue(mockAggregations);
      (prisma.attDailyRecord.findMany as any).mockResolvedValue([]);

      const dto: GetSummaryDto = {
        startDate: '2023-10-01',
        endDate: '2023-10-31',
      };

      const buffer = await service.exportDepartmentSummary(dto);
      
      expect(buffer).toBeInstanceOf(Buffer);
      // Verify magic bytes for zip (PK..) which xlsx uses
      expect(buffer[0]).toBe(0x50);
      expect(buffer[1]).toBe(0x4B);
    });
  });

  describe('Statistics Integration Test (SW71)', () => {
    describe('Story 1 & 2: 考勤明细查询', () => {
      it('AC1/AC6: Should return paginated daily records with filters (deptName, employeeName)', async () => {
        // Mock data
        const mockEmployee = { 
          id: 1, 
          name: 'Alice', 
          employeeNo: 'E001', 
          deptId: 1,
          department: { name: 'Tech' } 
        };
        const mockRecords = [
          {
            id: 1001n,
            employeeId: 1,
            workDate: new Date('2023-10-01'),
            shiftName: 'Morning',
            checkInTime: new Date('2023-10-01T09:00:00Z'),
            checkOutTime: new Date('2023-10-01T18:00:00Z'),
            status: 'normal',
            lateMinutes: 0,
            earlyLeaveMinutes: 0,
            absentMinutes: 0,
            leaveMinutes: 0,
          }
        ];

        // Mock implementation
        // For employeeName filter, first it finds employee
        (prisma.employee.findMany as any).mockResolvedValue([mockEmployee]);
        (prisma.attDailyRecord.findMany as any).mockResolvedValue(mockRecords);
        (prisma.attDailyRecord.count as any).mockResolvedValue(1);

        const dto: DailyRecordQuery = {
          startDate: '2023-10-01',
          endDate: '2023-10-01',
          employeeName: 'Alice',
          deptName: 'Tech',
          page: 1,
          pageSize: 10
        };

        const result = await service.getDailyRecords(dto);

        // Verify prisma calls
        // 1. Find employee by name
        expect(prisma.employee.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: expect.objectContaining({ name: { contains: 'Alice' } })
        }));

        // 2. Find daily records
        expect(prisma.attDailyRecord.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: expect.objectContaining({
            employeeId: { in: [1] }
          }),
          skip: 0,
          take: 10,
          orderBy: { workDate: 'desc' }
        }));

        expect(result.items).toHaveLength(1);
        expect(result.items[0].id).toBe('1001');
        expect(result.items[0].employeeName).toBe('Alice');
        expect(result.total).toBe(1);
      });
    });

    describe('Story 3: 导出每日明细', () => {
        it('AC1: Should generate Excel buffer via exportDailyRecords', async () => {
            // Mock data
            const mockEmployee = { 
              id: 1, 
              name: 'Alice', 
              employeeNo: 'E001', 
              deptId: 1,
              department: { name: 'Tech' } 
            };
            const mockRecords = [
              {
                id: 1001n,
                employeeId: 1,
                workDate: new Date('2023-10-01'),
                shiftName: 'Morning',
                status: 'normal',
              }
            ];
            
            // Re-mock getDailyRecords behavior
            (prisma.employee.findMany as any).mockResolvedValue([mockEmployee]);
            (prisma.attDailyRecord.count as any).mockResolvedValue(1);
            (prisma.attDailyRecord.findMany as any).mockResolvedValue(mockRecords);

            const query: DailyRecordQuery = {
                startDate: '2023-10-01',
                endDate: '2023-10-01'
            };

            const buffer = await service.exportDailyRecords(query);

            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer[0]).toBe(0x50);
            expect(buffer[1]).toBe(0x4B);
        });
    });

    describe('Story 3: App日历数据', () => {
      it('AC1/AC2: Should return calendar daily status', async () => {
        const mockRecords = [
          {
            workDate: new Date('2023-10-01'),
            status: 'normal',
            id: 1n
          },
          {
            workDate: new Date('2023-10-02'),
            status: 'late',
            id: 2n
          }
        ];

        (prisma.attDailyRecord.findMany as any).mockResolvedValue(mockRecords);

        const dto = {
          year: 2023,
          month: 10,
          employeeId: 1
        };

        const result = await service.getCalendar(dto.year, dto.month, dto.employeeId);

        expect(prisma.attDailyRecord.findMany).toHaveBeenCalled();
        expect(result).toHaveLength(2);
        
        expect(result[0].date).toBe('2023-10-01');
        expect(result[0].status).toBe('normal');
        expect(result[0].isAbnormal).toBe(false);

        expect(result[1].date).toBe('2023-10-02');
        expect(result[1].status).toBe('late');
        expect(result[1].isAbnormal).toBe(true);
      });
    });
  });

  describe('Statistics Integration Test (SW72)', () => {
    describe('Story 1: 部门考勤统计', () => {
      it('AC1: Should aggregate department stats', async () => {
        const mockRecords = [
          {
            employeeId: 1,
            status: 'normal',
            employee: { deptId: 1, department: { id: 1, name: 'Tech' } }
          },
          {
            employeeId: 2,
            status: 'late',
            employee: { deptId: 1, department: { id: 1, name: 'Tech' } }
          },
          {
            employeeId: 3,
            status: 'normal',
            employee: { deptId: 2, department: { id: 2, name: 'HR' } }
          }
        ];
        
        (prisma.attDailyRecord.findMany as any).mockResolvedValue(mockRecords);
        (prisma.employee.findMany as any).mockResolvedValue([
            { id: 1, deptId: 1 }, { id: 2, deptId: 1 }, { id: 3, deptId: 2 }
        ]);
        
        const dto: GetDeptStatsDto = {
          month: '2023-10',
        };
        
        const result = await service.getDeptStats(dto);
        
        // Should have 2 departments
        expect(result.length).toBeGreaterThanOrEqual(2);
        
        const techStats = result.find(r => r.deptId === 1);
        expect(techStats).toBeDefined();
        if (techStats) {
          expect(techStats.normalCount).toBe(1);
          expect(techStats.lateCount).toBe(1);
          // Total headcount is calculated from unique employees in records for simplicity in this mock,
          // or we should mock the behavior of counting distinct employees.
          // In the service implementation: totalHeadcount = deptEmployees.get(stats.deptId)?.size
          expect(techStats.totalHeadcount).toBe(2);
        }
        
        const hrStats = result.find(r => r.deptId === 2);
        expect(hrStats).toBeDefined();
        if (hrStats) {
            expect(hrStats.normalCount).toBe(1);
            expect(hrStats.totalHeadcount).toBe(1);
        }
      });
    });

    describe('Story 2: 考勤概览图表', () => {
      it('AC1: Should return daily trend and status distribution', async () => {
        const mockRecords = [
          { workDate: new Date('2023-10-01'), status: 'normal' },
          { workDate: new Date('2023-10-01'), status: 'absent' }, // 50% rate
          { workDate: new Date('2023-10-02'), status: 'normal' }, // 100% rate
        ];
        
        (prisma.attDailyRecord.findMany as any).mockResolvedValue(mockRecords);
        
        const dto: GetChartStatsDto = {
          startDate: '2023-10-01',
          endDate: '2023-10-02'
        };
        
        const result = await service.getChartStats(dto);
        
        expect(result.dailyTrend).toHaveLength(2);
        expect(result.dailyTrend[0].date).toBe('2023-10-01');
        expect(result.dailyTrend[0].attendanceRate).toBe(50);
        expect(result.dailyTrend[1].attendanceRate).toBe(100);
        
        expect(result.statusDistribution).toHaveLength(2);
        const normalDist = result.statusDistribution.find(d => d.status === 'normal');
        expect(normalDist?.count).toBe(2);
        const absentDist = result.statusDistribution.find(d => d.status === 'absent');
        expect(absentDist?.count).toBe(1);
      });
    });
  });
});
