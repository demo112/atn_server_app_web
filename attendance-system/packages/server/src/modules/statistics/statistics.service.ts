
import { prisma } from '../../common/db/prisma';
import { GetSummaryDto, AttendanceSummaryVo, DailyRecordQuery, DailyRecordVo, CalendarDailyVo, PaginatedResponse, AttendanceStatus } from '@attendance/shared';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';

export class StatisticsService {
  async getDailyRecords(query: DailyRecordQuery): Promise<PaginatedResponse<DailyRecordVo>> {
    const { startDate, endDate, deptId, employeeId, employeeName, status, page = 1, pageSize = 20 } = query;
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
        // 没找到员工，直接返回空
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
    if (deptId) {
      // 查找该部门下的所有员工
      const employees = await prisma.employee.findMany({
        where: { deptId: Number(deptId) },
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
          
          if (intersection.length === 0) {
            return {
              items: [],
              total: 0,
              page: Number(page),
              pageSize: Number(pageSize),
              totalPages: 0,
            };
          }
          whereClause.employeeId = { in: intersection };
        } else {
          whereClause.employeeId = { in: employees.map(e => e.id) };
        }
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

    // 5. 执行查询
    const [total, records] = await Promise.all([
      prisma.attDailyRecord.count({ where: whereClause }),
      prisma.attDailyRecord.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { workDate: 'desc' },
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
        shiftName: record.shiftName || undefined,
        checkInTime: record.checkInTime ? record.checkInTime.toISOString() : undefined,
        checkOutTime: record.checkOutTime ? record.checkOutTime.toISOString() : undefined,
        status: record.status as AttendanceStatus,
        lateMinutes: record.lateMinutes || 0,
        earlyLeaveMinutes: record.earlyLeaveMinutes || 0,
        absentMinutes: record.absentMinutes || 0,
        leaveMinutes: record.leaveMinutes || 0,
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
    const { startDate, endDate, deptId, employeeId } = dto;
    
    const queryStart = new Date(startDate + 'T00:00:00');
    const queryEnd = new Date(endDate + 'T23:59:59.999');

    const whereClause: any = {
      status: 'active',
    };
    if (deptId) whereClause.deptId = deptId;
    if (employeeId) whereClause.id = employeeId;

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
    // 注意: Prisma queryRaw 返回的大数类型 (BigInt) 需要转换，但在聚合函数结果中通常是 number 或 string
    const aggregations = await prisma.$queryRaw<any[]>`
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
        SUM(CASE WHEN leave_minutes > 0 THEN 1 ELSE 0 END) as leave_count,
        SUM(COALESCE(leave_minutes, 0)) as leave_minutes
      FROM att_daily_records
      WHERE employee_id IN (${Prisma.join(employeeIds)})
        AND work_date >= ${queryStart}
        AND work_date <= ${queryEnd}
      GROUP BY employee_id
    `;

    // 3. 组装结果
    const summaryMap = new Map<number, any>();
    for (const agg of aggregations) {
      summaryMap.set(Number(agg.employee_id), agg);
    }

    const result: AttendanceSummaryVo[] = employees.map(emp => {
      const agg = summaryMap.get(emp.id) || {};
      
      return {
        employeeId: emp.id,
        employeeNo: emp.employeeNo,
        employeeName: emp.name,
        deptId: emp.deptId || 0,
        deptName: emp.department?.name || '未分配',
        totalDays: Number(agg.total_days || 0),
        actualDays: Number(agg.actual_days || 0),
        lateCount: Number(agg.late_count || 0),
        lateMinutes: Number(agg.late_minutes || 0),
        earlyLeaveCount: Number(agg.early_leave_count || 0),
        earlyLeaveMinutes: Number(agg.early_leave_minutes || 0),
        absentCount: Number(agg.absent_count || 0),
        absentMinutes: Number(agg.absent_minutes || 0),
        leaveCount: Number(agg.leave_count || 0),
        leaveMinutes: Number(agg.leave_minutes || 0),
        actualMinutes: 0, // 暂不统计
        effectiveMinutes: 0, // 暂不统计
      };
    });

    return result;
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
      { header: '请假(分)', key: 'leaveMinutes', width: 10 },
    ];
    
    sheet.addRows(data);
    
    return await workbook.xlsx.writeBuffer() as Buffer;
  }
}
