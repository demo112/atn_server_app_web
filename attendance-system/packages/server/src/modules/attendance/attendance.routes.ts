
import { Router } from 'express';
import { attendanceSettingsController } from './attendance-settings.controller';
import { TimePeriodController } from './time-period/time-period.controller';
import { AttendanceShiftController } from './attendance-shift.controller';
import { AttendanceClockController } from './attendance-clock.controller';

const router = Router();
const periodController = new TimePeriodController();
const shiftController = new AttendanceShiftController();
const clockController = new AttendanceClockController();

// 考勤设置路由
router.get('/settings', attendanceSettingsController.getSettings);
router.put('/settings', attendanceSettingsController.updateSettings);

// 打卡记录路由
router.post('/clock', clockController.create.bind(clockController));
router.get('/clock', clockController.getList.bind(clockController));

// 时间段管理路由
router.get('/time-periods', periodController.findAll.bind(periodController));
router.get('/time-periods/:id', periodController.findOne.bind(periodController));
router.post('/time-periods', periodController.create.bind(periodController));
router.put('/time-periods/:id', periodController.update.bind(periodController));
router.delete('/time-periods/:id', periodController.remove.bind(periodController));

// 班次管理路由
router.get('/shifts', shiftController.getList.bind(shiftController));
router.get('/shifts/:id', shiftController.getById.bind(shiftController));
router.post('/shifts', shiftController.create.bind(shiftController));
router.put('/shifts/:id', shiftController.update.bind(shiftController));
router.delete('/shifts/:id', shiftController.delete.bind(shiftController));

export const attendanceRouter = router;
