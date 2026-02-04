import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { createUserSchema, updateUserSchema, getUsersSchema } from './user.dto';
import { createLogger } from '../../common/logger';

const logger = createLogger('user');

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || 'system';
      const dto = createUserSchema.parse(req.body);
      logger.info({ userId, username: dto.username, role: dto.role }, 'Creating user');
      
      const user = await userService.create(dto);
      
      logger.info({ userId, newUserId: user.id }, 'User created successfully');
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getUsersSchema.parse(req.query);
      const result = await userService.findAll(query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const user = await userService.findOne(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || 'system';
      const id = Number(req.params.id);
      const dto = updateUserSchema.parse(req.body);
      logger.info({ userId, targetId: id, updates: Object.keys(dto) }, 'Updating user');

      const user = await userService.update(id, dto);
      
      logger.info({ userId, targetId: id }, 'User updated successfully');
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || 'system';
      const id = Number(req.params.id);
      logger.info({ userId, targetId: id }, 'Deleting user');

      await userService.delete(id);
      
      logger.info({ userId, targetId: id }, 'User deleted successfully');
      res.json({ success: true, data: null });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
