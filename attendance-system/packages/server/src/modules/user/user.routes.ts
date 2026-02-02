import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware as authenticate } from '../../common/middleware/auth';

export const userRouter = Router();

userRouter.use(authenticate); // Protect all routes

userRouter.post('/', (req, res) => userController.create(req, res));
userRouter.get('/', (req, res) => userController.findAll(req, res));
userRouter.get('/:id', (req, res) => userController.findOne(req, res));
userRouter.put('/:id', (req, res) => userController.update(req, res));
userRouter.delete('/:id', (req, res) => userController.delete(req, res));
