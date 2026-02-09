
import { Router } from 'express';
import { authMiddleware as authenticate } from '../../common/middleware/auth';
import { LeaveController } from './leave.controller';

const router: Router = Router();
const leaveController = new LeaveController();

// 所有请假路由都需要认证
router.use(authenticate);

// 查询请假列表
router.get('/', leaveController.getList.bind(leaveController));

// 创建请假记录
router.post('/', leaveController.create.bind(leaveController));

// 更新请假记录
router.put('/:id', leaveController.update.bind(leaveController));

// 撤销请假记录
router.post('/:id/cancel', leaveController.cancel.bind(leaveController));

// 删除请假记录
router.delete('/:id', leaveController.delete.bind(leaveController));

export { router as leaveRouter };
