import { Request, Response } from 'express';
import { createLogger } from '../../common/logger';
import { attendanceSettingsService } from './attendance-settings.service';
import { success, error, errors } from '../../common/types/response';
import { UpdateSettingsDto } from './attendance-settings.dto';

export class AttendanceSettingsController {
  private logger = createLogger('AttendanceSettings');

  /**
   * 获取考勤设置
   */
  async getSettings(req: Request, res: Response) {
    try {
      this.logger.info('anon - Get settings');
      const data = await attendanceSettingsService.getSettings();
      return res.json(success(data));
    } catch (err: any) {
      this.logger.error({ err }, 'anon - getSettings error');
      return res.status(500).json(errors.internal());
    }
  }

  /**
   * 更新考勤设置
   */
  async updateSettings(req: Request, res: Response) {
    try {
      this.logger.info('anon - Update settings');
      const dto: UpdateSettingsDto = req.body;
      
      const data = await attendanceSettingsService.updateSettings(dto);
      return res.json(success(data));
    } catch (err: any) {
      if (err.message === 'INVALID_TIME_FORMAT') {
        this.logger.warn({ body: req.body }, 'anon - Invalid time format');
        return res.status(400).json(errors.badRequest('Invalid time format. Expected HH:mm'));
      }
      this.logger.error({ err }, 'anon - updateSettings error');
      return res.status(500).json(errors.internal());
    }
  }
}

export const attendanceSettingsController = new AttendanceSettingsController();
