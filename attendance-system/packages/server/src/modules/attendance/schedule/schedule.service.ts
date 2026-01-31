import { Prisma } from '@prisma/client';
import { prisma } from '../../../common/db/prisma';
import { CreateScheduleReqDto, BatchCreateScheduleReqDto } from './schedule.dto';
import { ScheduleVo } from '@attendance/shared';

export class ScheduleService {
  /**
   * 创建排班 (单人)
   */
  async create(data: CreateScheduleReqDto): Promise<ScheduleVo> {
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
      // 1. 检查冲突
      const conflicts = await tx.attSchedule.findMany({
        where: {
          employeeId,
          startDate: { lte: end },
          endDate: { gte: start },
        },
      });

      if (conflicts.length > 0) {
        if (!force) {
          throw new Error(`ERR_SCHEDULE_CONFLICT: Found ${conflicts.length} conflicting schedules`);
        }
        
        // Force mode: Resolve conflicts
        for (const conflict of conflicts) {
          await this.resolveConflict(tx, conflict, start, end);
        }
      }

      // 2. 创建新排班
      const created = await tx.attSchedule.create({
        data: {
          employeeId,
          shiftId,
          startDate: start,
          endDate: end,
        },
        include: {
          shift: true,
          employee: true,
        },
      });

      return this.mapToVo(created);
    });
  }

  /**
   * 批量排班 (部门)
   */
  async batchCreate(data: BatchCreateScheduleReqDto): Promise<{ count: number }> {
    const { departmentIds, shiftId, startDate, endDate, force, includeSubDepartments } = data;
    
    // 1. 获取目标员工 ID 列表
    let targetDeptIds = [...departmentIds];
    
    if (includeSubDepartments) {
      // 递归查找子部门
      // 简化实现：先查所有部门，在内存中构建树或查找
      // 考虑到部门数量通常不多，查全量部门可行
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
    // 为了保证原子性，应该在一个事务中吗？
    // 如果人数过多，事务可能会过大。建议分批或允许部分成功？
    // 需求未明确，这里采用单一大事务保证一致性
    
    await prisma.$transaction(async (tx) => {
      for (const emp of employees) {
        // 复用 create 逻辑 (需要重构 create 以支持传入 tx，或者在 create 内部不再开启新事务？)
        // Prisma 嵌套事务支持：如果 create 内部使用了 prisma.$transaction，它会自动复用外部 tx 吗？
        // Prisma 交互式事务支持嵌套，但需要传递 tx 客户端。
        // 为了复用，我将核心逻辑提取为 `createWithTx`
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
  private async createWithTx(tx: Prisma.TransactionClient, data: CreateScheduleReqDto) {
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
    });

    if (conflicts.length > 0) {
      if (!force) {
        // 在批量模式下，如果 force=false 且有冲突，整个批量失败？
        // 是的，默认行为。
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
      // Note: rootIds are already added to result in the caller? 
      // No, caller says: targetDeptIds = [...departmentIds, ...subDeptIds]
      // So here we strictly find children.
      
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
  async getOverview(query: { 
    employeeId?: number; 
    departmentId?: number; 
    startDate?: string; 
    endDate?: string 
  }): Promise<ScheduleVo[]> {
    const where: any = {};

    if (query.employeeId) {
      where.employeeId = Number(query.employeeId);
    }

    if (query.departmentId) {
      where.employee = { deptId: Number(query.departmentId) };
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
    if (!exists) throw new Error('ERR_SCHEDULE_NOT_FOUND');
    
    await prisma.attSchedule.delete({ where: { id } });
  }
}
