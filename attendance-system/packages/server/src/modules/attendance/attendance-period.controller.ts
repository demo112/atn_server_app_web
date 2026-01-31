import { Request, Response } from 'express';
import { AttendancePeriodService } from './attendance-period.service';
import { CreateTimePeriodDto, UpdateTimePeriodDto } from './attendance-period.dto';

const service = new AttendancePeriodService();

export class AttendancePeriodController {
  /**
   * 获取时间段列表
   */
  async getList(req: Request, res: Response) {
    try {
      const list = await service.findAll();
      res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [ERROR] [AttendancePeriod] Get list failed`, error);
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
   * 获取单个时间段详情
   */
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Invalid ID' },
        });
      }

      const period = await service.findById(id);
      if (!period) {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NOT_FOUND', message: 'Time period not found' },
        });
      }

      res.json({
        success: true,
        data: period,
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [ERROR] [AttendancePeriod] Get by ID failed`, error);
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
   * 创建时间段
   */
  async create(req: Request, res: Response) {
    try {
      const dto: CreateTimePeriodDto = req.body;
      
      // 简单参数校验
      if (!dto.name || !dto.startTime || !dto.endTime) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Missing required fields' },
        });
      }

      // 验证时间格式 HH:mm
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(dto.startTime) || !timeRegex.test(dto.endTime)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_FORMAT', message: 'Invalid time format (HH:mm required)' },
        });
      }

      const result = await service.create(dto);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [AttendancePeriod] Create failed`, error);
      
      if (error.message === 'ERR_ATT_PERIOD_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NAME_EXISTS', message: 'Time period name already exists' },
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
   * 更新时间段
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const dto: UpdateTimePeriodDto = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Invalid ID' },
        });
      }

      // 如果更新时间，验证格式
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if ((dto.startTime && !timeRegex.test(dto.startTime)) || 
          (dto.endTime && !timeRegex.test(dto.endTime))) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_FORMAT', message: 'Invalid time format (HH:mm required)' },
        });
      }

      const result = await service.update(id, dto);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [AttendancePeriod] Update failed`, error);
      
      if (error.message === 'ERR_ATT_PERIOD_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NOT_FOUND', message: 'Time period not found' },
        });
      }
      if (error.message === 'ERR_ATT_PERIOD_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NAME_EXISTS', message: 'Time period name already exists' },
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
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Invalid ID' },
        });
      }

      await service.delete(id);
      res.json({
        success: true,
        data: null,
      });
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [AttendancePeriod] Delete failed`, error);
      
      if (error.message === 'ERR_ATT_PERIOD_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_PERIOD_NOT_FOUND', message: 'Time period not found' },
        });
      }
      // if (error.message === 'ERR_ATT_PERIOD_IN_USE') ...

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
