
import { Router } from 'express';
import { departmentController } from './department.controller';
import { authMiddleware } from '../../common/middleware/auth';

export const departmentRouter: Router = Router();

// Apply authentication middleware to all routes
departmentRouter.use(authMiddleware);

// Routes
departmentRouter.get('/tree', (req, res) => departmentController.getTree(req, res));
departmentRouter.get('/:id', (req, res) => departmentController.getById(req, res));
departmentRouter.post('/', (req, res) => departmentController.create(req, res));
departmentRouter.put('/:id', (req, res) => departmentController.update(req, res));
departmentRouter.delete('/:id', (req, res) => departmentController.delete(req, res));
