import { Prisma } from '@prisma/client';
import { prisma } from '../../../common/db/prisma';
import { CreateScheduleDto, BatchCreateScheduleDto, ScheduleVo, ScheduleQueryDto } from '@attendance/shared';

export class ScheduleService {
  /**
   * 创建排班 (单人)
   */
  async create(data: CreateScheduleDto): Promise<ScheduleVo> {
    const { employeeId, shiftId, startDate, endDate, force } = data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 验证日期顺序
    if (start > end) {
      throw new Error('ERR_INVALID_DATE_RANGE: Start date must be before end date');
    }

    // 验证员工和班次是否存在
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new Error('ERR_EMPLOYEE_NOT_FOUND');
    
    const shift = await prisma.attShift.findUnique({ where: { id: shiftId } });
    if (!shift) throw new Error('ERR_SHIFT_NOT_FOUND');

    return await prisma.$transaction(async (tx) => {
      await this.createWithTx(tx, data);
      
      const created = await tx.attSchedule.findFirst({
        where: {
          employeeId,
          shiftId,
          startDate: start,
          endDate: end
        },
        include: {
          shift: true,
          employee: true,
        },
        orderBy: { id: 'desc' } // Get the one just created
      });

      if (!created) throw new Error('ERR_CREATE_FAILED');

      return this.mapToVo(created);
    });
  }

  /**
   * 批量排班 (部门)
   */
  async batchCreate(data: BatchCreateScheduleDto): Promise<{ count: number }> {
    const { departmentIds, shiftId, startDate, endDate, force, includeSubDepartments } = data;
    
    // 1. 获取目标员工 ID 列表
    let targetDeptIds = [...departmentIds];
    
    if (includeSubDepartments) {
      const allDepts = await prisma.department.findMany({ select: { id: true, parentId: true } });
      const subDeptIds = this.findAllSubDepartmentIds(departmentIds, allDepts);
      targetDeptIds = [...new Set([...targetDeptIds, ...subDeptIds])];
    }

    const employees = await prisma.employee.findMany({
      where: { deptId: { in: targetDeptIds }, status: 'active' },
      select: { id: true }
    });

    if (employees.length === 0) {
      return { count: 0 };
    }

    // 2. 批量执行
    await prisma.$transaction(async (tx) => {
      for (const emp of employees) {
        await this.createWithTx(tx, {
          employeeId: emp.id,
          shiftId,
          startDate,
          endDate,
          force
        });
      }
    }, {
      timeout: 20000 // 增加超时时间
    });

    return { count: employees.length };
  }

  /**
   * 核心创建逻辑 (支持事务传递)
   */
  private async createWithTx(tx: Prisma.TransactionClient, data: CreateScheduleDto) {
    const { employeeId, shiftId, startDate, endDate, force } = data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 检查冲突
    const conflicts = await tx.attSchedule.findMany({
      where: {
        employeeId,
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: {
        id: true,
        employeeId: true,
        shiftId: true,
        startDate: true,
        endDate: true,
      },
    });

    if (conflicts.length > 0) {
      if (!force) {
        throw new Error(`ERR_SCHEDULE_CONFLICT: Employee ${employeeId} has conflicts`);
      }
      
      for (const conflict of conflicts) {
        await this.resolveConflict(tx, conflict, start, end);
      }
    }

    await tx.attSchedule.create({
      data: {
        employeeId,
        shiftId,
        startDate: start,
        endDate: end,
      }
    });
  }

  /**
   * 解决冲突
   */
  private async resolveConflict(tx: Prisma.TransactionClient, old: any, newStart: Date, newEnd: Date) {
    const oldStart = old.startDate;
    const oldEnd = old.endDate;

    // 1. 完全包含 (Obsolete) -> 删除
    if (oldStart >= newStart && oldEnd <= newEnd) {
      await tx.attSchedule.delete({ where: { id: old.id } });
      return;
    }

    // 2. 左侧重叠 (Trim Right) -> 更新 End
    // Old: |---|
    // New:    |---|
    if (oldStart < newStart && oldEnd <= newEnd) {
      const trimmedEnd = this.addDays(newStart, -1);
      await tx.attSchedule.update({
        where: { id: old.id },
        data: { endDate: trimmedEnd }
      });
      return;
    }

    // 3. 右侧重叠 (Trim Left) -> 更新 Start
    // Old:      |---|
    // New: |---|
    if (oldStart >= newStart && oldEnd > newEnd) {
      const trimmedStart = this.addDays(newEnd, 1);
      await tx.attSchedule.update({
        where: { id: old.id },
        data: { startDate: trimmedStart }
      });
      return;
    }

    // 4. 中间被切 (Split) -> 更新 End + 新增 Right
    // Old: |-------|
    // New:   |---|
    if (oldStart < newStart && oldEnd > newEnd) {
      const leftEnd = this.addDays(newStart, -1);
      const rightStart = this.addDays(newEnd, 1);
      
      // 更新左段
      await tx.attSchedule.update({
        where: { id: old.id },
        data: { endDate: leftEnd }
      });

      // 创建右段
      await tx.attSchedule.create({
        data: {
          employeeId: old.employeeId,
          shiftId: old.shiftId,
          startDate: rightStart,
          endDate: oldEnd
        }
      });
    }
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private findAllSubDepartmentIds(rootIds: number[], allDepts: { id: number; parentId: number | null }[]): number[] {
    const result = new Set<number>();
    const queue = [...rootIds];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (result.has(currentId)) continue;
      
      const children = allDepts.filter(d => d.parentId === currentId);
      for (const child of children) {
        result.add(child.id);
        queue.push(child.id);
      }
    }
    return Array.from(result);
  }

  private mapToVo(schedule: any): ScheduleVo {
    return {
      ...schedule,
      startDate: schedule.startDate.toISOString().split('T')[0],
      endDate: schedule.endDate.toISOString().split('T')[0],
      shiftName: schedule.shift?.name,
      employeeName: schedule.employee?.name,
    };
  }

  /**
   * 查询排班
   */
  async getOverview(query: ScheduleQueryDto): Promise<ScheduleVo[]> {
    const where: any = {};

    if (query.employeeId) {
      where.employeeId = Number(query.employeeId);
    }

    if (query.deptId) {
      where.employee = { deptId: Number(query.deptId) };
    }

    if (query.startDate) {
      where.endDate = { gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      where.startDate = { lte: new Date(query.endDate) };
    }

    const schedules = await prisma.attSchedule.findMany({
      where,
      include: {
        shift: true,
        employee: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return schedules.map(s => this.mapToVo(s));
  }

  /**
   * 删除排班
   */
  async delete(id: number): Promise<void> {
    const exists = await prisma.attSchedule.findUnique({ where: { id } });
    if (!exists) {
      throw new Error('ERR_SCHEDULE_NOT_FOUND');
    }
    await prisma.attSchedule.delete({ where: { id } });
  }
}
