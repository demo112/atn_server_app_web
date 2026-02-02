import { Request, Response } from 'express';
import { LeaveService } from './leave.service';
import { CreateLeaveDto, UpdateLeaveDto, LeaveQueryDto } from './leave.dto';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';

const service = new LeaveService();
const logger = createLogger('LeaveController');

export class LeaveController {

  /**
   * 创建请假记录
   * 仅限管理员
   */
  async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      // 1. 权限检查: 仅管理员
      if (user.role !== 'admin') {
        throw new AppError('ERR_FORBIDDEN', 'Only admin can create leave records', 403);
      }

      const dto: CreateLeaveDto = {
        ...req.body,
        operatorId: user.id
      };

      const result = await service.create(dto);
      
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ err: error, body: req.body }, '[Leave] Create failed');
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      
      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_SERVER_ERROR', message: 'Internal server error' }
      });
    }
  }

  /**
   * 查询列表
   * 管理员: 可查所有 (可按部门/人员筛选)
   * 员工: 只能查自己
   */
  async getList(req: Request, res: Response) {
    try {
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
      
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error: any) {
      logger.error({ err: error, query: req.query }, '[Leave] Get list failed');
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_SERVER_ERROR', message: 'Internal server error' }
      });
    }
  }

  /**
   * 更新请假记录
   * 仅限管理员
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (user.role !== 'admin') {
        throw new AppError('ERR_FORBIDDEN', 'Only admin can update leave records', 403);
      }

      const dto: UpdateLeaveDto = {
        ...req.body,
        operatorId: user.id
      };

      const result = await service.update(Number(id), dto);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ err: error, body: req.body, id: req.params.id }, '[Leave] Update failed');
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_SERVER_ERROR', message: 'Internal server error' }
      });
    }
  }

  /**
   * 撤销请假记录
   * 仅限管理员
   */
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      if (user.role !== 'admin') {
        throw new AppError('ERR_FORBIDDEN', 'Only admin can cancel leave records', 403);
      }

      const result = await service.cancel(Number(id), user.id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error({ err: error, id: req.params.id }, '[Leave] Cancel failed');
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_SERVER_ERROR', message: 'Internal server error' }
      });
    }
  }
}
