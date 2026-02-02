import { Request, Response } from 'express';
import { ScheduleService } from './schedule.service';
import { CreateScheduleReqDto, BatchCreateScheduleReqDto } from './schedule.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { logger } from '../../../common/logger';
import { AppError } from '../../../common/errors';

const service = new ScheduleService();

export class ScheduleController {
  
  /**
   * 创建排班 (单人)
   */
  async create(req: Request, res: Response) {
    try {
      const dto = plainToInstance(CreateScheduleReqDto, req.body);
      const errors = await validate(dto);
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_VALIDATION_FAILED',
            message: 'Validation failed',
            details: errors.map(e => Object.values(e.constraints || {})).flat(),
          }
        });
      }

      const result = await service.create(dto);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error({ error, body: req.body }, '[Schedule] Create failed');
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_ERROR', message: error.message }
      });
    }
  }

  /**
   * 批量排班 (部门)
   */
  async batchCreate(req: Request, res: Response) {
    try {
      const dto = plainToInstance(BatchCreateScheduleReqDto, req.body);
      const errors = await validate(dto);
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_VALIDATION_FAILED',
            message: 'Validation failed',
            details: errors.map(e => Object.values(e.constraints || {})).flat(),
          }
        });
      }

      const result = await service.batchCreate(dto);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error({ error, body: req.body }, '[Schedule] Batch create failed');
      
      if (error.message.startsWith('ERR_SCHEDULE_CONFLICT')) {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_SCHEDULE_CONFLICT', message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_ERROR', message: error.message }
      });
    }
  }

  /**
   * 查询排班
   */
  async getOverview(req: Request, res: Response) {
    try {
      const query = {
        employeeId: req.query.employeeId ? Number(req.query.employeeId) : undefined,
        deptId: req.query.deptId ? Number(req.query.deptId) : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await service.getOverview(query);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('[Schedule] Get overview failed', { error, query: req.query });
      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_ERROR', message: error.message }
      });
    }
  }

  /**
   * 删除排班
   */
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_ID', message: 'Invalid ID' }
        });
      }

      await service.delete(id);
      
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      logger.error('[Schedule] Delete failed', { error, params: req.params });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { code: error.code, message: error.message }
        });
      }

      res.status(500).json({
        success: false,
        error: { code: 'ERR_INTERNAL_ERROR', message: error.message }
      });
    }
  }
}
