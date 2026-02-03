import { Request, Response } from 'express';
import { AttendanceShiftService } from './attendance-shift.service';
import { CreateShiftDto, UpdateShiftDto } from './attendance-shift.dto';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { success } from '../../common/types/response';

const service = new AttendanceShiftService();
const logger = createLogger('AttendanceShiftController');

export class AttendanceShiftController {
  /**
   * 获取班次列表
   */
  async getList(req: Request, res: Response) {
    const name = req.query.name as string;
    const list = await service.findAll(name);
    res.json(success(list));
  }

  /**
   * 获取单个班次详情
   */
  async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid ID', 400);
    }

    const shift = await service.findById(id);
    if (!shift) {
      throw new AppError('ERR_ATT_SHIFT_NOT_FOUND', 'Shift not found', 404);
    }

    res.json(success(shift));
  }

  /**
   * 创建班次
   */
  async create(req: Request, res: Response) {
    const dto: CreateShiftDto = req.body;

    // 基础校验
    if (!dto.name) {
      throw new AppError('ERR_INVALID_PARAM', 'Missing required fields (name)', 400);
    }

    // 校验 cycleDays (如有)
    if (dto.cycleDays && dto.cycleDays < 1) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid cycleDays', 400);
    }

    // 校验 days 结构
    if (dto.days) {
      for (const day of dto.days) {
        if (day.dayOfCycle < 1 || day.dayOfCycle > (dto.cycleDays ?? 7)) {
          throw new AppError('ERR_INVALID_PARAM', `Invalid dayOfCycle: ${day.dayOfCycle}`, 400);
        }
      }
    }

    const result = await service.create(dto);
    res.status(201).json(success(result));
  }

  /**
   * 更新班次
   */
  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid ID', 400);
    }

    const dto: UpdateShiftDto = req.body;
    // 校验 days 结构 (如有)
    // 注意：这里无法校验 cycleDays 范围，因为 update dto 没有 cycleDays
    // 假设 dayOfCycle 始终是 1-7 或 1-30，后端校验基本范围即可
    if (dto.days) {
      for (const day of dto.days) {
        if (day.dayOfCycle < 1) {
          throw new AppError('ERR_INVALID_PARAM', `Invalid dayOfCycle: ${day.dayOfCycle}`, 400);
        }
      }
    }

    const result = await service.update(id, dto);
    res.json(success(result));
  }

  /**
   * 删除班次
   */
  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new AppError('ERR_INVALID_PARAM', 'Invalid ID', 400);
    }

    await service.delete(id);
    res.json(success({ message: 'Shift deleted successfully' }));
  }
}
