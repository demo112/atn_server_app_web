import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { CreateLeaveDto, UpdateLeaveDto, LeaveQueryDto, AttLeaveVo } from './leave.dto';
import { Prisma, LeaveStatus, LeaveType } from '@prisma/client';
import invariant from 'tiny-invariant';
import dayjs from 'dayjs';
import { attendanceScheduler } from './attendance-scheduler';
import { departmentService } from '../department/department.service';

export class LeaveService {
  private logger = createLogger('LeaveService');

  /**
   * 转换为 VO
   */
  private mapToVo(record: any): AttLeaveVo {
    return {
      id: record.id,
      employeeId: record.employeeId,
      type: record.type,
      startTime: record.startTime,
      endTime: record.endTime,
      reason: record.reason,
      status: record.status,
      approverId: record.approverId,
      approvedAt: record.approvedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      
      // 关联信息
      employeeName: record.employee?.name,
      deptName: record.employee?.department?.name,
      approverName: record.approver?.username, // 审批人/操作人
    };
  }

  /**
   * 创建请假记录
   */
  async create(data: CreateLeaveDto & { status?: LeaveStatus, approverId?: number, approvedAt?: Date }) {
    // 1. 验证参数
    // Fix: 兼容前端可能传来的中文类型
    if (!Object.values(LeaveType).includes(data.type)) {
      const typeMap: Record<string, LeaveType> = {
        '事假': LeaveType.personal,
        '病假': LeaveType.sick,
        '年假': LeaveType.annual,
        '出差': LeaveType.business_trip,
        '产假': LeaveType.maternity,
        '陪产假': LeaveType.paternity,
        '婚假': LeaveType.marriage,
        '丧假': LeaveType.bereavement,
        '其他': LeaveType.other
      };
      
      const mappedType = typeMap[data.type as unknown as string];
      if (mappedType) {
        data.type = mappedType;
      } else {
        throw new AppError('ERR_INVALID_PARAMS', `Invalid leave type: ${data.type}`, 400);
      }
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (startTime >= endTime) {
      throw new AppError('ERR_LEAVE_INVALID_TIME', 'Start time must be before end time', 400);
    }

    // 2. 检查员工是否存在
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId }
    });
    if (!employee) {
      throw new AppError('ERR_EMPLOYEE_NOT_FOUND', 'Employee not found', 404);
    }

    // 3. 检查时间重叠 (排除已取消的)
    // Overlap: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
    const overlap = await prisma.attLeave.findFirst({
      where: {
        employeeId: data.employeeId,
        status: { not: LeaveStatus.cancelled },
        startTime: { lt: endTime },
        endTime: { gt: startTime }
      }
    });

    if (overlap) {
      throw new AppError('ERR_LEAVE_TIME_OVERLAP', 'Leave time overlaps with existing record', 400);
    }

    // 4. 创建记录
    // 默认为 Approved (保留兼容性)，但通常由 Controller 传入 status
    const status = data.status || LeaveStatus.approved;
    const approverId = status === LeaveStatus.pending ? null : (data.approverId || data.operatorId);
    const approvedAt = status === LeaveStatus.pending ? null : (data.approvedAt || new Date());

    const record = await prisma.attLeave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startTime,
        endTime,
        reason: data.reason,
        status,
        approverId,
        approvedAt,
      },
      include: {
        employee: {
          include: { department: true }
        },
        approver: true
      }
    });

    this.logger.info(`Created leave record: Emp ${record.employeeId} Type ${record.type} (ID: ${record.id})`);
    
    return this.mapToVo(record);
  }

  /**
   * 查询列表
   */
  async findAll(query: LeaveQueryDto) {
    const { page = 1, pageSize = 20, employeeId, deptId, startTime, endTime, type, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;
    if (status) where.status = status;
    
    // 时间范围查询 (查询所有与指定范围有重叠的记录)
    // RecordStart < QueryEnd AND RecordEnd > QueryStart
    if (startTime || endTime) {
      const start = startTime ? new Date(startTime) : new Date('1970-01-01');
      const end = endTime ? new Date(endTime) : new Date('2099-12-31');
      
      where.startTime = { lt: end };
      where.endTime = { gt: start };
    }
    
    // 部门查询 (支持递归)
    if (deptId) {
      const deptIds = await departmentService.getSubDepartmentIds(deptId);
      where.employee = { deptId: { in: deptIds } };
    }

    const [total, items] = await Promise.all([
      prisma.attLeave.count({ where }),
      prisma.attLeave.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { startTime: 'desc' },
        include: {
          employee: {
            include: { department: true }
          },
          approver: true
        }
      })
    ]);

    return {
      items: items.map(item => this.mapToVo(item)),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize))
    };
  }

  /**
   * 更新/撤销
   * 管理员可以修改时间/类型/原因，或者撤销(status=cancelled)
   */
  async update(id: number, data: UpdateLeaveDto) {
     const record = await prisma.attLeave.findUnique({
      where: { id }
    });
    
    if (!record) {
      throw new AppError('ERR_LEAVE_NOT_FOUND', 'Leave record not found', 404);
    }

    // 如果要修改时间，需要再次检查重叠 (排除自己)
    if (data.startTime || data.endTime) {
      const newStart = data.startTime ? new Date(data.startTime) : record.startTime;
      const newEnd = data.endTime ? new Date(data.endTime) : record.endTime;

      if (newStart >= newEnd) {
         throw new AppError('ERR_LEAVE_INVALID_TIME', 'Start time must be before end time', 400);
      }

      const overlap = await prisma.attLeave.findFirst({
        where: {
          id: { not: id },
          employeeId: record.employeeId,
          status: { not: LeaveStatus.cancelled },
          startTime: { lt: newEnd },
          endTime: { gt: newStart }
        }
      });

      if (overlap) {
        throw new AppError('ERR_LEAVE_TIME_OVERLAP', 'Leave time overlaps with existing record', 400);
      }
    }

    const updated = await prisma.attLeave.update({
      where: { id },
      data: {
        type: data.type,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        reason: data.reason,
        // 更新时记录最后操作人? 目前模型没有 lastOperatorId，只有 approverId
        // 既然是 admin 修改，保持 approverId 为 admin 是合理的，或者更新 approverId
        approverId: data.operatorId,
      },
      include: {
        employee: {
          include: { department: true }
        },
        approver: true
      }
    });

    this.logger.info(`Updated leave record: ID ${id}`);

    // 触发重算
    // 1. 如果原记录是已通过，需要重算原时间段 (清除旧影响)
    if (record.status === LeaveStatus.approved) {
       await this.triggerRecalculation(record.employeeId, record.startTime, record.endTime);
    }
    
    // 2. 如果新记录是已通过，需要重算新时间段 (应用新影响)
    if (updated.status === LeaveStatus.approved) {
       await this.triggerRecalculation(updated.employeeId, updated.startTime, updated.endTime);
    }

    return this.mapToVo(updated);
  }

  /**
   * 触发重新计算
   */
  private async triggerRecalculation(employeeId: number, startTime: Date, endTime: Date) {
    const startDate = dayjs(startTime).format('YYYY-MM-DD');
    const endDate = dayjs(endTime).format('YYYY-MM-DD');
    
    try {
      await attendanceScheduler.triggerCalculation({
        startDate,
        endDate,
        employeeIds: [employeeId]
      });
    } catch (err) {
      this.logger.error({ err, employeeId, startDate, endDate }, 'Failed to trigger recalculation');
    }
  }

  /**
   * 撤销 (软删除)
   */
  async cancel(id: number, operatorId: number) {
    const record = await prisma.attLeave.findUnique({ where: { id } });
    if (!record) throw new AppError('ERR_LEAVE_NOT_FOUND', 'Record not found', 404);

    const updated = await prisma.attLeave.update({
      where: { id },
      data: {
        status: LeaveStatus.cancelled,
        approverId: operatorId // 记录是谁撤销的
      },
      include: {
        employee: { include: { department: true } },
        approver: true
      }
    });
    
    this.logger.info(`Cancelled leave record: ID ${id}`);

    // 如果原记录是已通过，需要重算
    if (record.status === LeaveStatus.approved) {
       await this.triggerRecalculation(record.employeeId, record.startTime, record.endTime);
    }

    return this.mapToVo(updated);
  }

  /**
   * 删除请假记录 (物理删除)
   */
  async delete(id: number) {
    const record = await prisma.attLeave.findUnique({ where: { id } });
    if (!record) {
      throw new AppError('ERR_LEAVE_NOT_FOUND', 'Record not found', 404);
    }

    await prisma.attLeave.delete({ where: { id } });
    
    this.logger.info(`Deleted leave record: ID ${id}`);

    // 如果原记录是已通过，需要重算
    if (record.status === LeaveStatus.approved) {
       await this.triggerRecalculation(record.employeeId, record.startTime, record.endTime);
    }

    return { id };
  }
}
