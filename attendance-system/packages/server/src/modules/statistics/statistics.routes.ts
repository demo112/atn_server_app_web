
import { Router } from 'express';
import { StatisticsController } from './statistics.controller';
import { authMiddleware as authenticate } from '../../common/middleware/auth';

const router = Router();
const controller = new StatisticsController();

// 所有统计接口都需要登录
router.use(authenticate);

router.get('/summary', controller.getDepartmentSummary);
router.get('/details', controller.getDailyRecords);
router.get('/calendar', controller.getCalendar);
router.get('/departments', controller.getDeptStats);
router.get('/charts', controller.getChartStats);
router.get('/export', controller.exportStats);
router.post('/calculate', controller.triggerCalculation);

export const statisticsRouter = router;
