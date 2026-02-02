import { Router } from 'express';
import { employeeController } from './employee.controller';
import { authMiddleware } from '../../common/middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post('/', employeeController.create);
router.get('/', employeeController.findAll);
router.get('/:id', employeeController.findOne);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.delete);
router.post('/:id/bind-user', employeeController.bindUser);

export const employeeRouter = router;
