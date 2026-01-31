import { Router } from 'express';
import { attendanceSettingsController } from './attendance-settings.controller';

const router = Router();

// 考勤设置路由
router.get('/settings', attendanceSettingsController.getSettings);
router.put('/settings', attendanceSettingsController.updateSettings);

export const attendanceRouter = router;
