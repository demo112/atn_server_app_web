import { Request, Response } from 'express';
import { AttendanceClockService } from './attendance-clock.service';
import { CreateClockDto, ClockQueryDto } from './attendance-clock.dto';
import { ClockSource } from '@prisma/client';
import { logger } from '../../common/logger';

const service = new AttendanceClockService();

export class AttendanceClockController {
  
  /**
   * 创建打卡记录
   * App端: 自动获取当前登录员工
   * Web端: 需要指定 employeeId, 并记录操作人
   */
  async create(req: Request, res: Response) {
    try {
      const dto: CreateClockDto = req.body;
      const user = (req as any).user;

      // 1. 权限与参数处理
      if (dto.source === ClockSource.app) {
        // App打卡必须由登录用户操作，且必须绑定员工
        if (!user || !user.employeeId) {
          return res.status(403).json({
            success: false,
            error: { code: 'ERR_AUTH_NO_EMPLOYEE', message: 'Current user is not linked to an employee' }
          });
        }
        dto.employeeId = user.employeeId;
        // App打卡不需要 operatorId (或者认为是用户自己)
      } else if (dto.source === ClockSource.web) {
        // Web补录/代打卡
        if (!dto.employeeId) {
          return res.status(400).json({
            success: false,
            error: { code: 'ERR_PARAM_MISSING', message: 'employeeId is required for Web clock-in' }
          });
        }
        dto.operatorId = user?.id;
      }

      // 2. 调用服务
      const result = await service.create(dto);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error({ error, body: req.body }, '[AttendanceClock] Create failed');
      
      if (error.message === 'ERR_EMPLOYEE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_EMPLOYEE_NOT_FOUND', message: 'Employee not found' }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to create clock record',
        },
      });
    }
  }

  /**
   * 查询打卡记录
   */
  async getList(req: Request, res: Response) {
    try {
      const query: ClockQueryDto = req.query;
      const user = (req as any).user;

      // 权限控制: 非管理员只能看自己的
      if (user && user.role !== 'admin') {
        if (!user.employeeId) {
          return res.status(403).json({
            success: false,
            error: { code: 'ERR_AUTH_NO_EMPLOYEE', message: 'No employee linked' }
          });
        }
        query.employeeId = user.employeeId;
      }

      const result = await service.findAll(query);
      
      res.json({
        success: true,
        ...result, // items, pagination
      });
    } catch (error: any) {
      logger.error({ error, query: req.query }, '[AttendanceClock] Get list failed');
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }
      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve clock records',
        },
      });
    }
  }
}
