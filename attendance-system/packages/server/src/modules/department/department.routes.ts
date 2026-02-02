
import { Router } from 'express';
import { departmentController } from './department.controller';
import { authMiddleware } from '../../common/middleware/auth';

export const departmentRouter = Router();

// Apply authentication middleware to all routes
departmentRouter.use(authMiddleware);

// Routes
departmentRouter.get('/tree', (req, res, next) => departmentController.getTree(req, res, next));
departmentRouter.get('/:id', (req, res, next) => departmentController.getById(req, res, next));
departmentRouter.post('/', (req, res, next) => departmentController.create(req, res, next));
departmentRouter.put('/:id', (req, res, next) => departmentController.update(req, res, next));
departmentRouter.delete('/:id', (req, res, next) => departmentController.delete(req, res, next));
