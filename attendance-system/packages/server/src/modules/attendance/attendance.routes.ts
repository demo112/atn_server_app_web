
import { Router } from 'express';
import { authMiddleware as authenticate } from '../../common/middleware/auth';
import { attendanceSettingsController } from './attendance-settings.controller';
import { TimePeriodController } from './time-period/time-period.controller';
import { AttendanceShiftController } from './attendance-shift.controller';
import { AttendanceClockController } from './attendance-clock.controller';
import { AttendanceCorrectionController } from './attendance-correction.controller';
import { ScheduleController } from './schedule/schedule.controller';
import { LeaveController } from './leave.controller';

const router = Router();

// 所有考勤路由都需要认证
router.use(authenticate);

const periodController = new TimePeriodController();
const shiftController = new AttendanceShiftController();
const clockController = new AttendanceClockController();
const correctionController = new AttendanceCorrectionController();
const scheduleController = new ScheduleController();
const leaveController = new LeaveController();

// 考勤设置路由
router.get('/settings', attendanceSettingsController.getSettings);
router.put('/settings', attendanceSettingsController.updateSettings);

// 打卡记录路由
router.post('/clock', clockController.create.bind(clockController));
router.get('/clock', clockController.getList.bind(clockController));

// 补签/每日考勤路由
router.post('/corrections/check-in', correctionController.checkIn.bind(correctionController));
router.post('/corrections/check-out', correctionController.checkOut.bind(correctionController));
router.get('/corrections', correctionController.getCorrections.bind(correctionController));
router.put('/corrections/:id', correctionController.updateCorrection.bind(correctionController));
router.delete('/corrections/:id', correctionController.deleteCorrection.bind(correctionController));
router.get('/daily', correctionController.getDailyRecords.bind(correctionController));

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

// 排班管理路由
router.post('/schedules', scheduleController.create.bind(scheduleController));
router.post('/schedules/batch', scheduleController.batchCreate.bind(scheduleController));
router.get('/schedules', scheduleController.getOverview.bind(scheduleController));
router.delete('/schedules/:id', scheduleController.delete.bind(scheduleController));

// 请假管理路由
router.post('/leaves', leaveController.create.bind(leaveController));
router.get('/leaves', leaveController.getList.bind(leaveController));
router.put('/leaves/:id', leaveController.update.bind(leaveController));
router.delete('/leaves/:id', leaveController.cancel.bind(leaveController));

export const attendanceRouter = router;
