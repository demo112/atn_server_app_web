import { Request, Response } from 'express';
import { AttendancePeriodService } from './attendance-period.service';
import { CreateTimePeriodDto, UpdateTimePeriodDto } from './attendance-period.dto';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { success } from '../../common/types/response';

const service = new AttendancePeriodService();
const logger = createLogger('AttendancePeriodController');

export class AttendancePeriodController {
  /**
   * 获取时间段列表
   */
  async getList(req: Request, res: Response) {
    const list = await service.findAll();
    res.json(success(list));
  }

  /**
   * 获取单个时间段详情
   */
  async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid ID', 400);
    }

    const period = await service.findById(id);
    if (!period) {
      throw new AppError('ERR_ATT_PERIOD_NOT_FOUND', 'Time period not found', 404);
    }

    res.json(success(period));
  }

  /**
   * 创建时间段
   */
  async create(req: Request, res: Response) {
    const dto: CreateTimePeriodDto = req.body;
    
    // 简单参数校验
    if (!dto.name || !dto.startTime || !dto.endTime) {
      throw new AppError('ERR_INVALID_PARAM', 'Missing required fields', 400);
    }

    // 验证时间格式 HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(dto.startTime) || !timeRegex.test(dto.endTime)) {
      throw new AppError('ERR_INVALID_FORMAT', 'Invalid time format (HH:mm required)', 400);
    }

    const result = await service.create(dto);
    res.status(201).json(success(result));
  }

  /**
   * 更新时间段
   */
  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const dto: UpdateTimePeriodDto = req.body;

    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid ID', 400);
    }

    // 如果更新时间，验证格式
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if ((dto.startTime && !timeRegex.test(dto.startTime)) || 
        (dto.endTime && !timeRegex.test(dto.endTime))) {
      throw new AppError('ERR_INVALID_FORMAT', 'Invalid time format (HH:mm required)', 400);
    }

    const result = await service.update(id, dto);
    res.json(success(result));
  }

  /**
   * 删除时间段
   */
  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid ID', 400);
    }

    await service.delete(id);
    res.json(success(null));
  }
}
