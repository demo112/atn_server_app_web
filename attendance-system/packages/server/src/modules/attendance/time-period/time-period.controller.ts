
import { Request, Response } from 'express';
import { TimePeriodService } from './time-period.service';
import { CreateTimePeriodReqDto, UpdateTimePeriodReqDto } from './time-period.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const service = new TimePeriodService();

export class TimePeriodController {
  
  /**
   * 创建时间段
   */
  async create(req: Request, res: Response) {
    try {
      // DTO 转换与验证
      const dto = plainToInstance(CreateTimePeriodReqDto, req.body);
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
      console.error(`[${new Date().toISOString()}] [ERROR] [TimePeriod] Create failed`, error);
      
      if (error.message === 'ERR_ATT_PERIOD_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NAME_EXISTS', message: 'Time period name already exists' }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to create time period',
        },
      });
    }
  }

  /**
   * 获取列表
   */
  async findAll(req: Request, res: Response) {
    try {
      const result = await service.findAll();
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [TimePeriod] Find all failed`, error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve time periods',
        },
      });
    }
  }

  /**
   * 获取详情
   */
  async findOne(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_ID', message: 'Invalid ID' }
        });
      }

      const result = await service.findById(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NOT_FOUND', message: 'Time period not found' }
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [TimePeriod] Find one failed`, error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve time period',
        },
      });
    }
  }

  /**
   * 更新时间段
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_ID', message: 'Invalid ID' }
        });
      }

      // DTO 转换与验证
      const dto = plainToInstance(UpdateTimePeriodReqDto, req.body);
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

      const result = await service.update(id, dto);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [TimePeriod] Update failed`, error);
      
      if (error.message === 'ERR_ATT_PERIOD_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NOT_FOUND', message: 'Time period not found' }
        });
      }
      if (error.message === 'ERR_ATT_PERIOD_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NAME_EXISTS', message: 'Time period name already exists' }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to update time period',
        },
      });
    }
  }

  /**
   * 删除时间段
   */
  async remove(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_ID', message: 'Invalid ID' }
        });
      }

      await service.remove(id);
      
      res.json({
        success: true,
        data: null,
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [TimePeriod] Remove failed`, error);
      
      if (error.message === 'ERR_ATT_PERIOD_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NOT_FOUND', message: 'Time period not found' }
        });
      }
      if (error.message === 'ERR_ATT_PERIOD_IN_USE') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_IN_USE', message: 'Time period is in use by shifts' }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to delete time period',
        },
      });
    }
  }
}
