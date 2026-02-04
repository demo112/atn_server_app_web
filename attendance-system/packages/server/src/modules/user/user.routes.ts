import { Router } from 'express';
import { userController } from './user.controller';
import { authMiddleware as authenticate } from '../../common/middleware/auth';

export const userRouter = Router();

userRouter.use(authenticate); // Protect all routes

userRouter.post('/', userController.create.bind(userController));
userRouter.get('/', userController.findAll.bind(userController));
userRouter.get('/:id', userController.findOne.bind(userController));
userRouter.put('/:id', userController.update.bind(userController));
userRouter.delete('/:id', userController.delete.bind(userController));
