import { Router } from 'express';
import { attendanceSettingsController } from './attendance-settings.controller';
import { AttendancePeriodController } from './attendance-period.controller';

const router = Router();
const periodController = new AttendancePeriodController();

// 考勤设置路由
router.get('/settings', attendanceSettingsController.getSettings);
router.put('/settings', attendanceSettingsController.updateSettings);

// 时间段管理路由
router.get('/time-periods', periodController.getList.bind(periodController));
router.get('/time-periods/:id', periodController.getById.bind(periodController));
router.post('/time-periods', periodController.create.bind(periodController));
router.put('/time-periods/:id', periodController.update.bind(periodController));
router.delete('/time-periods/:id', periodController.delete.bind(periodController));

export const attendanceRouter = router;
