
import { prisma } from '../../common/db/prisma';
import { GetSummaryDto, AttendanceSummaryVo } from '@attendance/shared';
import { Prisma } from '@prisma/client';

export class StatisticsService {
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
}
