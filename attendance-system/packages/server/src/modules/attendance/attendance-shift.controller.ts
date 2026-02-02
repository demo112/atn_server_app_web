import { Request, Response } from 'express';
import { AttendanceShiftService } from './attendance-shift.service';
import { CreateShiftDto, UpdateShiftDto } from './attendance-shift.dto';
import { createLogger } from '../../common/logger';

const service = new AttendanceShiftService();
const logger = createLogger('AttendanceShiftController');

export class AttendanceShiftController {
  /**
   * 获取班次列表
   */
  async getList(req: Request, res: Response) {
    try {
      const name = req.query.name as string;
      const list = await service.findAll(name);
      res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      logger.error({ err: error }, 'Get list failed');
      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve shifts',
        },
      });
    }
  }

  /**
   * 获取单个班次详情
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

      const shift = await service.findById(id);
      if (!shift) {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_SHIFT_NOT_FOUND', message: 'Shift not found' },
        });
      }

      res.json({
        success: true,
        data: shift,
      });
    } catch (error) {
      logger.error({ err: error }, 'Get by ID failed');
      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve shift',
        },
      });
    }
  }

  /**
   * 创建班次
   */
  async create(req: Request, res: Response) {
    try {
      const dto: CreateShiftDto = req.body;

      // 基础校验
      if (!dto.name) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Missing required fields (name)' },
        });
      }

      // 校验 cycleDays (如有)
      if (dto.cycleDays && dto.cycleDays < 1) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Invalid cycleDays' },
        });
      }

      // 校验 days 结构
      if (dto.days) {
        for (const day of dto.days) {
          if (day.dayOfCycle < 1 || day.dayOfCycle > (dto.cycleDays ?? 7)) {
            return res.status(400).json({
              success: false,
              error: { code: 'ERR_INVALID_PARAM', message: `Invalid dayOfCycle: ${day.dayOfCycle}` },
            });
          }
        }
      }

      const result = await service.create(dto);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Create failed');

      if (error.message === 'ERR_ATT_SHIFT_NAME_EXISTS' || error.code === 'ERR_ATT_SHIFT_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_SHIFT_NAME_EXISTS', message: 'Shift name already exists' },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to create shift',
        },
      });
    }
  }

  /**
   * 更新班次
   */
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: { code: 'ERR_INVALID_PARAM', message: 'Invalid ID' },
        });
      }

      const dto: UpdateShiftDto = req.body;
      // 校验 days 结构 (如有)
      // 注意：这里无法校验 cycleDays 范围，因为 update dto 没有 cycleDays
      // 假设 dayOfCycle 始终是 1-7 或 1-30，后端校验基本范围即可
      if (dto.days) {
        for (const day of dto.days) {
          if (day.dayOfCycle < 1) {
            return res.status(400).json({
              success: false,
              error: { code: 'ERR_INVALID_PARAM', message: `Invalid dayOfCycle: ${day.dayOfCycle}` },
            });
          }
        }
      }

      const result = await service.update(id, dto);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Update failed');

      if (error.message === 'ERR_ATT_SHIFT_NOT_FOUND' || error.code === 'ERR_ATT_SHIFT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_SHIFT_NOT_FOUND', message: 'Shift not found' },
        });
      }
      if (error.message === 'ERR_ATT_SHIFT_NAME_EXISTS' || error.code === 'ERR_ATT_SHIFT_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_SHIFT_NAME_EXISTS', message: 'Shift name already exists' },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to update shift',
        },
      });
    }
  }

  /**
   * 删除班次
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
        data: { message: 'Shift deleted successfully' },
      });
    } catch (error: any) {
      logger.error({ err: error }, 'Delete failed');

      if (error.message === 'ERR_ATT_SHIFT_NOT_FOUND' || error.code === 'ERR_ATT_SHIFT_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_ATT_SHIFT_NOT_FOUND', message: 'Shift not found' },
        });
      }
      if (error.message === 'ERR_ATT_SHIFT_IN_USE' || error.code === 'ERR_ATT_SHIFT_IN_USE') {
        return res.status(409).json({
          success: false,
          error: { code: 'ERR_ATT_SHIFT_IN_USE', message: 'Shift is in use by schedules' },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERR_INTERNAL_SERVER_ERROR',
          message: 'Failed to delete shift',
        },
      });
    }
  }
}
