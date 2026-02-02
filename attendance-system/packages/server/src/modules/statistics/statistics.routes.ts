
import { Router } from 'express';
import { StatisticsController } from './statistics.controller';
import { authMiddleware as authenticate } from '../../common/middleware/auth';

const router = Router();
const controller = new StatisticsController();

// 所有统计接口都需要登录
router.use(authenticate);

router.get('/summary', controller.getDepartmentSummary);

export const statisticsRouter = router;
