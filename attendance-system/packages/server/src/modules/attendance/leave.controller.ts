import { Request, Response } from 'express';
import { LeaveService } from './leave.service';
import { CreateLeaveDto, UpdateLeaveDto, LeaveQueryDto } from './leave.dto';
import { LeaveStatus } from '@prisma/client';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { success } from '../../common/types/response';

const service = new LeaveService();
const logger = createLogger('LeaveController');

export class LeaveController {

  /**
   * 创建请假记录
   * 管理员: 直接通过
   * 员工: 提交申请 (pending)
   */
  async create(req: Request, res: Response) {
    const user = (req as any).user;
    
    let targetEmployeeId = req.body.employeeId;
    let status: LeaveStatus = LeaveStatus.pending;
    let approverId = undefined;
    let approvedAt = undefined;

    // 1. 权限与状态判定
    if (user.role === 'admin') {
      // 管理员创建: 默认为 Approved
      status = LeaveStatus.approved;
      approverId = user.id;
      approvedAt = new Date();
      
      // 如果未指定 employeeId，报错 (管理员必须指定给谁请假)
      if (!targetEmployeeId) {
           throw new AppError('ERR_INVALID_PARAMS', '管理员创建请假时必须指定员工（employeeId）', 400);
      }
    } else {
      // 普通员工: 只能给自己申请
      if (!user.employeeId) {
        throw new AppError('ERR_AUTH_NO_EMPLOYEE', '当前用户未关联员工', 403);
      }
      // 强制覆盖为自己的 ID
      targetEmployeeId = user.employeeId;
      status = LeaveStatus.pending;
    }

    const dto: CreateLeaveDto & { status?: LeaveStatus, approverId?: number, approvedAt?: Date } = {
      ...req.body,
      employeeId: targetEmployeeId,
      operatorId: user.id,
      status,
      approverId,
      approvedAt
    };

    const result = await service.create(dto);
    
    res.status(201).json(success(result));
  }

  /**
   * 查询列表
   * 管理员: 可查所有 (可按部门/人员筛选)
   * 员工: 只能查自己
   */
  async getList(req: Request, res: Response) {
    const user = (req as any).user;
    const query: LeaveQueryDto = req.query;

    // 权限控制
    if (user.role !== 'admin') {
      // 非管理员强制查询自己
      if (!user.employeeId) {
         throw new AppError('ERR_AUTH_NO_EMPLOYEE', 'No employee linked', 403);
      }
      query.employeeId = user.employeeId;
      // 清除其他敏感筛选
      delete query.deptId;
    }

    const result = await service.findAll(query);
    
    res.json(success(result));
  }

  /**
   * 更新请假记录
   * 仅限管理员
   */
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user;

    if (user.role !== 'admin') {
      throw new AppError('ERR_FORBIDDEN', '仅管理员可更新请假记录', 403);
    }

    const dto: UpdateLeaveDto = {
      ...req.body,
      operatorId: user.id
    };

    const result = await service.update(Number(id), dto);
    
    res.json(success(result));
  }

  /**
   * 撤销请假记录
   * 仅限管理员
   */
  async cancel(req: Request, res: Response) {
    const { id } = req.params;
    const user = (req as any).user;

    if (user.role !== 'admin') {
      throw new AppError('ERR_FORBIDDEN', '仅管理员可撤销请假记录', 403);
    }

    const result = await service.cancel(Number(id), user.id);
    
    res.json(success(result));
  }
}
