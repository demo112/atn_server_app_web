
import { prisma } from '../../common/db/prisma';
import { GetSummaryDto, AttendanceSummaryVo } from '@attendance/shared';

export class StatisticsService {
  async getDepartmentSummary(dto: GetSummaryDto): Promise<AttendanceSummaryVo[]> {
    const { startDate, endDate, deptId, employeeId } = dto;
    
    // 简单处理日期范围
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

    // 2. 获取每日考勤记录
    const dailyRecords = await prisma.attDailyRecord.findMany({
      where: {
        employeeId: { in: employeeIds },
        workDate: {
          gte: queryStart,
          lte: queryEnd,
        },
      },
    });

    // 3. 获取请假记录
    const leaves = await prisma.attLeave.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: 'approved',
        OR: [
          { startTime: { lte: queryEnd }, endTime: { gte: queryStart } }
        ]
      },
    });

    // 4. 聚合数据
    const summaryMap = new Map<number, AttendanceSummaryVo>();

    // 初始化 VO
    for (const emp of employees) {
      summaryMap.set(emp.id, {
        employeeId: emp.id,
        employeeNo: emp.employeeNo,
        employeeName: emp.name,
        deptId: emp.deptId || 0,
        deptName: emp.department?.name || '未分配',
        totalDays: 0,
        actualDays: 0,
        lateCount: 0,
        lateMinutes: 0,
        earlyLeaveCount: 0,
        earlyLeaveMinutes: 0,
        absentCount: 0,
        absentMinutes: 0,
        leaveCount: 0,
        leaveMinutes: 0,
        actualMinutes: 0,
        effectiveMinutes: 0,
      });
    }

    // 聚合 DailyRecords
    for (const record of dailyRecords) {
      const vo = summaryMap.get(record.employeeId);
      if (!vo) continue;

      vo.totalDays++;
      
      if (record.status !== 'absent') {
          vo.actualDays++;
      }

      if ((record.lateMinutes || 0) > 0) {
        vo.lateMinutes += record.lateMinutes || 0;
        vo.lateCount++;
      }

      if ((record.earlyLeaveMinutes || 0) > 0) {
        vo.earlyLeaveMinutes += record.earlyLeaveMinutes || 0;
        vo.earlyLeaveCount++;
      }

      if (record.status === 'absent') {
        vo.absentMinutes += record.absentMinutes || 0;
        vo.absentCount++;
      }

      vo.actualMinutes += record.actualMinutes || 0;
      vo.effectiveMinutes += record.effectiveMinutes || 0;
    }

    // 聚合 Leaves
    for (const leave of leaves) {
      const vo = summaryMap.get(leave.employeeId);
      if (!vo) continue;

      vo.leaveCount++;
      
      // 计算交集时长
      const leaveStart = leave.startTime < queryStart ? queryStart : leave.startTime;
      const leaveEnd = leave.endTime > queryEnd ? queryEnd : leave.endTime;
      const durationMs = leaveEnd.getTime() - leaveStart.getTime();
      
      if (durationMs > 0) {
         const minutes = Math.floor(durationMs / 1000 / 60);
         vo.leaveMinutes += minutes;
      }
    }

    return Array.from(summaryMap.values());
  }
}
