import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { CreateLeaveDto, UpdateLeaveDto, LeaveQueryDto, AttLeaveVo } from './leave.dto';
import { Prisma, LeaveStatus } from '@prisma/client';
import invariant from 'tiny-invariant';

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
  async create(data: CreateLeaveDto) {
    // 1. 验证参数
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

    // 4. 创建记录 (默认通过)
    const record = await prisma.attLeave.create({
      data: {
        employeeId: data.employeeId,
        type: data.type,
        startTime,
        endTime,
        reason: data.reason,
        status: LeaveStatus.approved, // 管理员录入即生效
        approverId: data.operatorId,  // 操作人即审批人
        approvedAt: new Date(),
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
    
    // 部门查询 (简单匹配，暂不支持递归)
    if (deptId) {
      where.employee = { deptId };
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
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      }
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
    return this.mapToVo(updated);
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
    return this.mapToVo(updated);
  }
}
