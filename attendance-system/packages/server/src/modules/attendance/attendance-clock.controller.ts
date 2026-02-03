import { Request, Response } from 'express';
import { AttendanceClockService } from './attendance-clock.service';
import { CreateClockDto, ClockQueryDto } from './attendance-clock.dto';
import { ClockSource } from '@prisma/client';
import { logger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { success } from '../../common/types/response';

const service = new AttendanceClockService();

export class AttendanceClockController {
  
  /**
   * 创建打卡记录
   * App端: 自动获取当前登录员工
   * Web端: 需要指定 employeeId, 并记录操作人
   */
  async create(req: Request, res: Response) {
    const dto: CreateClockDto = req.body;
    const user = (req as any).user;

    // 1. 权限与参数处理
    if (dto.source === ClockSource.app) {
      // App打卡必须由登录用户操作，且必须绑定员工
      if (!user || !user.employeeId) {
        throw new AppError('ERR_AUTH_NO_EMPLOYEE', 'Current user is not linked to an employee', 403);
      }
      dto.employeeId = user.employeeId;
      // App打卡不需要 operatorId (或者认为是用户自己)
    } else if (dto.source === ClockSource.web) {
      // Web补录/代打卡
      if (!dto.employeeId) {
        throw new AppError('ERR_PARAM_MISSING', 'employeeId is required for Web clock-in', 400);
      }
      dto.operatorId = user?.id;
    }

    // 2. 调用服务
    const result = await service.create(dto);
    
    res.status(201).json(success(result));
  }

  /**
   * 查询打卡记录
   */
  async getList(req: Request, res: Response) {
    const query: ClockQueryDto = req.query;
    const user = (req as any).user;

    // 权限控制: 非管理员只能看自己的
    if (user && user.role !== 'admin') {
      if (!user.employeeId) {
        throw new AppError('ERR_AUTH_NO_EMPLOYEE', 'No employee linked', 403);
      }
      query.employeeId = user.employeeId;
    }

    const result = await service.findAll(query);
    
    res.json(success(result));
  }
}
