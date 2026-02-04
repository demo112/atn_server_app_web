
import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { 
  GetSummaryDto, 
  AttendanceSummaryVo, 
  DailyRecordQuery, 
  DailyRecordVo, 
  CalendarDailyVo, 
  PaginatedResponse, 
  AttendanceStatus,
  DeptStatsVo,
  GetDeptStatsDto,
  ChartStatsVo,
  GetChartStatsDto,
  ExportStatsDto
} from '@attendance/shared';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

interface AggregationResult {
  employee_id: number;
  total_days: number | bigint;
  actual_days: number | bigint;
  late_count: number | bigint;
  late_minutes: number | bigint;
  early_leave_count: number | bigint;
  early_leave_minutes: number | bigint;
  absent_count: number | bigint;
  absent_minutes: number | bigint;
  missing_count: number | bigint;
  leave_count: number | bigint;
  leave_minutes: number | bigint;
  actual_minutes: number | bigint;
  effective_minutes: number | bigint;
}

export class StatisticsService {
  private logger = createLogger('StatisticsService');

  async getDailyRecords(query: DailyRecordQuery): Promise<PaginatedResponse<DailyRecordVo>> {
    this.logger.info({ query }, 'Fetching daily records');
    const { startDate, endDate, deptId, deptName, employeeId, employeeName, status, page = 1, pageSize = 20 } = query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const whereClause: any = {};

    // 1. 日期范围筛选
    if (startDate && endDate) {
      whereClause.workDate = {
        gte: new Date(startDate + 'T00:00:00'),
        lte: new Date(endDate + 'T23:59:59.999'),
      };
    }

    // 2. 状态筛选
    if (status) {
      whereClause.status = status;
    }

    // 3. 员工筛选 (支持ID或模糊搜索)
    if (employeeId) {
      whereClause.employeeId = Number(employeeId);
    } else if (employeeName) {
      // 需要关联查询员工姓名，这里我们先查出员工ID
      const employees = await prisma.employee.findMany({
        where: { name: { contains: employeeName } },
        select: { id: true },
      });
      if (employees.length > 0) {
        whereClause.employeeId = { in: employees.map(e => e.id) };
      } else {
        return {
          items: [],
          total: 0,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: 0,
        };
      }
    }

    // 4. 部门筛选
    if (deptId || deptName) {
      const deptWhere: Prisma.EmployeeWhereInput = {};
      if (deptId) deptWhere.deptId = Number(deptId);
      if (deptName) deptWhere.department = { name: { contains: deptName } };

      // 查找该部门下的所有员工
      const employees = await prisma.employee.findMany({
        where: deptWhere,
        select: { id: true },
      });
      if (employees.length > 0) {
        // 如果已经有employeeId筛选，取交集
        if (whereClause.employeeId) {
          const existingIds = typeof whereClause.employeeId === 'number' 
            ? [whereClause.employeeId] 
            : (whereClause.employeeId.in as number[]);
          
          const deptEmployeeIds = employees.map(e => e.id);
          const intersection = existingIds.filter(id => deptEmployeeIds.includes(id));
          
          if (intersection.length > 0) {
            whereClause.employeeId = { in: intersection };
          } else {
            // 交集为空，返回空
            return {
              items: [],
              total: 0,
              page: Number(page),
              pageSize: Number(pageSize),
              totalPages: 0,
            };
          }
        } else {
          whereClause.employeeId = { in: employees.map(e => e.id) };
        }
      } else {
        // 部门下无员工，返回空
        return {
          items: [],
          total: 0,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: 0,
        };
      }
    }

    // 5. 执行查询
    const [total, records] = await Promise.all([
      prisma.attDailyRecord.count({ where: whereClause }),
      prisma.attDailyRecord.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { workDate: 'desc' },
        include: { 
          shift: true,
          period: true 
        },
      }),
    ]);

    // 6. 补充员工和部门信息
    // 收集所有涉及的员工ID
    const distinctEmployeeIds = [...new Set(records.map(r => r.employeeId))];
    const employeesInfo = await prisma.employee.findMany({
      where: { id: { in: distinctEmployeeIds } },
      include: { department: true },
    });
    
    const employeeMap = new Map(employeesInfo.map(e => [e.id, e]));

    // 7. 组装结果
    const items: DailyRecordVo[] = records.map(record => {
      const emp = employeeMap.get(record.employeeId);
      return {
        id: record.id.toString(),
        employeeId: record.employeeId,
        employeeName: emp?.name || '未知',
        employeeNo: emp?.employeeNo || '',
        deptName: emp?.department?.name || '未分配',
        workDate: record.workDate.toISOString().split('T')[0],
        shiftName: record.shift?.name,
        startTime: record.period?.startTime || undefined,
        endTime: record.period?.endTime || undefined,
        checkInTime: record.checkInTime ? record.checkInTime.toISOString() : undefined,
        checkOutTime: record.checkOutTime ? record.checkOutTime.toISOString() : undefined,
        status: record.status as AttendanceStatus,
        lateMinutes: record.lateMinutes || 0,
        earlyLeaveMinutes: record.earlyLeaveMinutes || 0,
        absentMinutes: record.absentMinutes || 0,
        leaveMinutes: record.leaveMinutes || 0,
        workMinutes: record.actualMinutes || undefined,
        remark: record.remark || undefined,
      };
    });

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize)),
    };
  }

  async getCalendar(year: number, month: number, employeeId: number): Promise<CalendarDailyVo[]> {
    // 构造月份起止时间
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await prisma.attDailyRecord.findMany({
      where: {
        employeeId: Number(employeeId),
        workDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        workDate: true,
        status: true,
      },
    });

    return records.map(record => ({
      date: record.workDate.toISOString().split('T')[0],
      status: record.status as AttendanceStatus,
      isAbnormal: record.status !== 'normal',
    }));
  }

  async getDepartmentSummary(dto: GetSummaryDto): Promise<AttendanceSummaryVo[]> {
    this.logger.info({ dto }, 'Calculating department summary');
    const { startDate, endDate, deptId, deptName, employeeId, employeeName } = dto;
    
    const queryStart = new Date(startDate + 'T00:00:00');
    const queryEnd = new Date(endDate + 'T23:59:59.999');

    const whereClause: Prisma.EmployeeWhereInput = {
      status: 'active',
    };
    if (deptId) whereClause.deptId = deptId;
    if (deptName) {
      whereClause.department = {
        name: { contains: deptName }
      };
    }
    if (employeeId) whereClause.id = employeeId;
    if (employeeName) whereClause.name = { contains: employeeName };

    // 1. 获取员工列表
    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
      },
    });

    if (employees.length === 0) return [];

    const employeeIds = employees.map(e => e.id);

    // 2. 使用聚合查询获取统计数据
    const aggregations = await prisma.$queryRaw<AggregationResult[]>`
      SELECT 
        employee_id,
        COUNT(*) as total_days,
        SUM(CASE WHEN status IN ('normal', 'late', 'early_leave') THEN 1 ELSE 0 END) as actual_days,
        SUM(CASE WHEN late_minutes > 0 THEN 1 ELSE 0 END) as late_count,
        SUM(COALESCE(late_minutes, 0)) as late_minutes,
        SUM(CASE WHEN early_leave_minutes > 0 THEN 1 ELSE 0 END) as early_leave_count,
        SUM(COALESCE(early_leave_minutes, 0)) as early_leave_minutes,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(COALESCE(absent_minutes, 0)) as absent_minutes,
        SUM(CASE WHEN status = 'missing' THEN 1 ELSE 0 END) as missing_count,
        SUM(CASE WHEN leave_minutes > 0 THEN 1 ELSE 0 END) as leave_count,
        SUM(COALESCE(leave_minutes, 0)) as leave_minutes,
        SUM(COALESCE(actual_minutes, 0)) as actual_minutes,
        SUM(COALESCE(effective_minutes, 0)) as effective_minutes
      FROM att_daily_records
      WHERE employee_id IN (${Prisma.join(employeeIds)})
        AND work_date >= ${queryStart}
        AND work_date <= ${queryEnd}
      GROUP BY employee_id
    `;

    // 2.5 获取每日详情用于生成 monthly grid
    const dailyRecords = await prisma.attDailyRecord.findMany({
      where: {
        employeeId: { in: employeeIds },
        workDate: {
          gte: queryStart,
          lte: queryEnd,
        },
      },
      select: {
        employeeId: true,
        workDate: true,
        status: true,
      },
    });

    const dailyStatusMap = new Map<number, Map<number, string>>();
    for (const r of dailyRecords) {
      if (!dailyStatusMap.has(r.employeeId)) dailyStatusMap.set(r.employeeId, new Map());
      // 使用 UTC Date 以保持与 toISOString 一致
      const day = r.workDate.getUTCDate(); 
      dailyStatusMap.get(r.employeeId)!.set(day, r.status);
    }

    const statusSymbolMap: Record<string, string> = {
      'normal': '√',
      'late': '迟',
      'early_leave': '早',
      'absent': '旷',
      'leave': '假',
      'missing': '缺',
    };

    return employees.map(emp => {
      const agg = aggregations.find(a => Number(a.employee_id) === emp.id);
      const dailyMap = dailyStatusMap.get(emp.id);
      
      // 生成每日状态数组 (1-31)
      const daily: string[] = [];
      const daysInMonth = new Date(queryEnd.getFullYear(), queryEnd.getMonth() + 1, 0).getDate();
      
      for (let d = 1; d <= daysInMonth; d++) {
        const status = dailyMap?.get(d);
        daily.push(status ? (statusSymbolMap[status] || status) : '-');
      }

      return {
        employeeId: emp.id,
        employeeNo: emp.employeeNo,
        employeeName: emp.name,
        deptId: emp.deptId || 0,
        deptName: emp.department?.name || '未分配',
        totalDays: Number(agg?.total_days || 0),
        actualDays: Number(agg?.actual_days || 0),
        lateCount: Number(agg?.late_count || 0),
        lateMinutes: Number(agg?.late_minutes || 0),
        earlyLeaveCount: Number(agg?.early_leave_count || 0),
        earlyLeaveMinutes: Number(agg?.early_leave_minutes || 0),
        absentCount: Number(agg?.absent_count || 0),
        absentMinutes: Number(agg?.absent_minutes || 0),
        missingCount: Number(agg?.missing_count || 0),
        leaveCount: Number(agg?.leave_count || 0),
        leaveMinutes: Number(agg?.leave_minutes || 0),
        actualMinutes: Number(agg?.actual_minutes || 0),
        effectiveMinutes: Number(agg?.effective_minutes || 0),
        daily
      };
    });
  }

  async exportDepartmentSummary(dto: GetSummaryDto): Promise<Buffer> {
    const data = await this.getDepartmentSummary(dto);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('考勤汇总');

    sheet.columns = [
      { header: '工号', key: 'employeeNo', width: 15 },
      { header: '姓名', key: 'employeeName', width: 15 },
      { header: '部门', key: 'deptName', width: 20 },
      { header: '应出勤(天)', key: 'totalDays', width: 12 },
      { header: '实出勤(天)', key: 'actualDays', width: 12 },
      { header: '迟到(次)', key: 'lateCount', width: 10 },
      { header: '迟到(分)', key: 'lateMinutes', width: 10 },
      { header: '早退(次)', key: 'earlyLeaveCount', width: 10 },
      { header: '早退(分)', key: 'earlyLeaveMinutes', width: 10 },
      { header: '缺勤(次)', key: 'absentCount', width: 10 },
      { header: '缺勤(分)', key: 'absentMinutes', width: 10 },
      { header: '缺卡(次)', key: 'missingCount', width: 10 },
      { header: '请假(次)', key: 'leaveCount', width: 10 },
      { header: '请假(分)', key: 'leaveMinutes', width: 10 },
    ];

    sheet.addRows(data);
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async exportDailyRecords(query: DailyRecordQuery): Promise<Buffer> {
    // 获取所有记录 (不分页)
    const { items } = await this.getDailyRecords({
      ...query,
      page: 1,
      pageSize: 100000 // Ensure we get all records
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('每日考勤明细');

    sheet.columns = [
      { header: '日期', key: 'workDate', width: 15 },
      { header: '工号', key: 'employeeNo', width: 15 },
      { header: '姓名', key: 'employeeName', width: 15 },
      { header: '部门', key: 'deptName', width: 20 },
      { header: '班次', key: 'shiftName', width: 15 },
      { header: '上班时间', key: 'checkInTime', width: 20 },
      { header: '下班时间', key: 'checkOutTime', width: 20 },
      { header: '考勤状态', key: 'status', width: 12 },
      { header: '迟到(分)', key: 'lateMinutes', width: 10 },
      { header: '早退(分)', key: 'earlyLeaveMinutes', width: 10 },
      { header: '缺勤(分)', key: 'absentMinutes', width: 10 },
    ];

    const statusMap: Record<string, string> = {
      'normal': '正常',
      'late': '迟到',
      'early_leave': '早退',
      'absent': '旷工',
      'leave': '请假',
      'missing': '缺卡',
      'rest': '休息',
      'business_trip': '出差',
    };

    const rows = items.map(item => ({
      ...item,
      status: statusMap[item.status] || item.status,
      checkInTime: item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString('zh-CN') : '--',
      checkOutTime: item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString('zh-CN') : '--',
    }));

    sheet.addRows(rows);
    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async getDeptStats(dto: GetDeptStatsDto): Promise<DeptStatsVo[]> {
    this.logger.info({ dto }, 'Calculating department stats');
    const { month, deptId } = dto;
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const whereClause: any = {
      workDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (deptId) {
      const employees = await prisma.employee.findMany({
        where: { deptId: Number(deptId) },
        select: { id: true },
      });
      whereClause.employeeId = { in: employees.map(e => e.id) };
    }

    const records = await prisma.attDailyRecord.findMany({
      where: whereClause,
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    });

    const statsMap = new Map<number, DeptStatsVo>();
    const deptEmployees = new Map<number, Set<number>>();

    for (const record of records) {
      const dept = record.employee.department;
      if (!dept) continue;

      const dId = dept.id;
      
      // Track employees per dept for headcount
      if (!deptEmployees.has(dId)) deptEmployees.set(dId, new Set());
      deptEmployees.get(dId)!.add(record.employeeId);

      // Initialize stats if not exists
      if (!statsMap.has(dId)) {
        statsMap.set(dId, {
          deptId: dId,
          deptName: dept.name,
          totalHeadcount: 0,
          normalCount: 0,
          lateCount: 0,
          earlyLeaveCount: 0,
          absentCount: 0,
          leaveCount: 0,
          attendanceRate: 0,
        });
      }

      const stats = statsMap.get(dId)!;
      // Increment counts based on status
      if (record.status === 'normal') stats.normalCount++;
      else if (record.status === 'late') stats.lateCount++;
      else if (record.status === 'early_leave') stats.earlyLeaveCount++;
      else if (record.status === 'absent') stats.absentCount++;
      else if (record.status === 'leave') stats.leaveCount++;
    }

    // Calculate rates and finalize result
    return Array.from(statsMap.values()).map(stats => {
      stats.totalHeadcount = deptEmployees.get(stats.deptId)?.size || 0;
      
      const presentCount = stats.normalCount + stats.lateCount + stats.earlyLeaveCount;
      const totalRecords = presentCount + stats.absentCount + stats.leaveCount;
      
      stats.attendanceRate = totalRecords > 0 
        ? Number(((presentCount / totalRecords) * 100).toFixed(2)) 
        : 0;
      
      return stats;
    });
  }

  async getChartStats(dto: GetChartStatsDto): Promise<ChartStatsVo> {
    this.logger.info({ dto }, 'Calculating chart stats');
    const { startDate, endDate, deptId } = dto;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59.999');

    const whereClause: any = {
      workDate: {
        gte: start,
        lte: end,
      },
    };

    if (deptId) {
      const employees = await prisma.employee.findMany({
        where: { deptId: Number(deptId) },
        select: { id: true },
      });
      whereClause.employeeId = { in: employees.map(e => e.id) };
    }

    const records = await prisma.attDailyRecord.findMany({
      where: whereClause,
      select: {
        workDate: true,
        status: true,
      },
    });

    // 1. Daily Trend
    const dailyMap = new Map<string, { present: number; total: number }>();
    
    for (const r of records) {
      const dateStr = r.workDate.toISOString().split('T')[0];
      if (!dailyMap.has(dateStr)) dailyMap.set(dateStr, { present: 0, total: 0 });
      
      const day = dailyMap.get(dateStr)!;
      day.total++;
      
      if (['normal', 'late', 'early_leave'].includes(r.status)) {
        day.present++;
      }
    }

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        attendanceRate: stats.total > 0 ? Number(((stats.present / stats.total) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. Status Distribution
    const statusMap = new Map<string, number>();
    for (const r of records) {
      const s = r.status;
      statusMap.set(s, (statusMap.get(s) || 0) + 1);
    }

    const statusDistribution = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    return { dailyTrend, statusDistribution };
  }

  async exportStats(dto: ExportStatsDto): Promise<Buffer> {
    const stats = await this.getDeptStats({ month: dto.month, deptId: dto.deptId });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('部门统计报表');

    sheet.columns = [
      { header: '部门', key: 'deptName', width: 20 },
      { header: '总人数', key: 'totalHeadcount', width: 10 },
      { header: '出勤率(%)', key: 'attendanceRate', width: 12 },
      { header: '正常(次)', key: 'normalCount', width: 10 },
      { header: '迟到(次)', key: 'lateCount', width: 10 },
      { header: '早退(次)', key: 'earlyLeaveCount', width: 10 },
      { header: '缺勤(次)', key: 'absentCount', width: 10 },
      { header: '请假(次)', key: 'leaveCount', width: 10 },
    ];

    sheet.addRows(stats);

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
}
