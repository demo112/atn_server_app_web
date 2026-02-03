import { Request, Response } from 'express';
import { createLogger } from '../../common/logger';
import { attendanceSettingsService } from './attendance-settings.service';
import { success, error, errors } from '../../common/types/response';
import { UpdateSettingsDto } from './attendance-settings.dto';
import { AppError } from '../../common/errors';

export class AttendanceSettingsController {
  private logger = createLogger('AttendanceSettings');

  /**
   * 获取考勤设置
   */
  async getSettings(req: Request, res: Response) {
    this.logger.info('anon - Get settings');
    const data = await attendanceSettingsService.getSettings();
    return res.json(success(data));
  }

  /**
   * 更新考勤设置
   */
  async updateSettings(req: Request, res: Response) {
    this.logger.info('anon - Update settings');
    const dto: UpdateSettingsDto = req.body;
    
    // Validate time format before calling service if needed, or let service handle it.
    // Assuming service throws AppError or we catch specific logic if absolutely necessary.
    // For T16, we prefer removing try-catch.
    // If the service throws 'INVALID_TIME_FORMAT', it should ideally be an AppError.
    // I will assume for now we just propagate.
    const data = await attendanceSettingsService.updateSettings(dto);
    return res.json(success(data));
  }
}

export const attendanceSettingsController = new AttendanceSettingsController();
