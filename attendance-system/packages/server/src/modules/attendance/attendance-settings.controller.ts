import { Request, Response } from 'express';
import { attendanceSettingsService } from './attendance-settings.service';
import { success, error, errors } from '../../common/types/response';
import { UpdateSettingsDto } from './attendance-settings.dto';

export class AttendanceSettingsController {
  /**
   * 获取考勤设置
   */
  async getSettings(req: Request, res: Response) {
    try {
      console.log(`[${new Date().toISOString()}] [INFO] [AttendanceSettings] anon - Get settings`);
      const data = await attendanceSettingsService.getSettings();
      return res.json(success(data));
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] [ERROR] [AttendanceSettings] anon - getSettings error:`, err);
      return res.status(500).json(errors.internal());
    }
  }

  /**
   * 更新考勤设置
   */
  async updateSettings(req: Request, res: Response) {
    try {
      console.log(`[${new Date().toISOString()}] [INFO] [AttendanceSettings] anon - Update settings`);
      const dto: UpdateSettingsDto = req.body;
      
      const data = await attendanceSettingsService.updateSettings(dto);
      return res.json(success(data));
    } catch (err: any) {
      if (err.message === 'INVALID_TIME_FORMAT') {
        console.warn(`[${new Date().toISOString()}] [WARN] [AttendanceSettings] anon - Invalid time format`, req.body);
        return res.status(400).json(errors.badRequest('Invalid time format. Expected HH:mm'));
      }
      console.error(`[${new Date().toISOString()}] [ERROR] [AttendanceSettings] anon - updateSettings error:`, err);
      return res.status(500).json(errors.internal());
    }
  }
}

export const attendanceSettingsController = new AttendanceSettingsController();
