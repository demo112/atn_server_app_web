import { Request, Response } from 'express';
import { userService } from './user.service';
import { createUserSchema, updateUserSchema, getUsersSchema } from './user.dto';
import { createLogger } from '../../common/logger';

const logger = createLogger('user');

export class UserController {
  async create(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const dto = createUserSchema.parse(req.body);
      logger.info({ userId, username: dto.username, role: dto.role }, 'Creating user');
      
      const user = await userService.create(dto);
      
      logger.info({ userId, newUserId: user.id }, 'User created successfully');
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      logger.error({ userId, error: error.message, stack: error.stack }, 'Create user failed');
      res.status(400).json({ success: false, error: { code: 'ERR_USER_CREATE', message: error.message } });
    }
  }

  async findAll(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const query = getUsersSchema.parse(req.query);
      const result = await userService.findAll(query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error({ userId, error: error.message, query: req.query }, 'Find users failed');
      res.status(500).json({ success: false, error: { code: 'ERR_USER_LIST', message: error.message } });
    }
  }

  async findOne(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const id = Number(req.params.id);
      const user = await userService.findOne(id);
      res.json({ success: true, data: user });
    } catch (error: any) {
      // 404 is not always a system error, but we can log it as warn or info if needed. 
      // Keeping it simple, maybe just log if it's an unexpected error? 
      // But here we catch everything. Let's log warn for not found.
      logger.warn({ userId, targetId: req.params.id, error: error.message }, 'User not found');
      res.status(404).json({ success: false, error: { code: 'ERR_USER_NOT_FOUND', message: error.message } });
    }
  }

  async update(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const id = Number(req.params.id);
      const dto = updateUserSchema.parse(req.body);
      logger.info({ userId, targetId: id, updates: Object.keys(dto) }, 'Updating user');

      const user = await userService.update(id, dto);
      
      logger.info({ userId, targetId: id }, 'User updated successfully');
      res.json({ success: true, data: user });
    } catch (error: any) {
      logger.error({ userId, targetId: req.params.id, error: error.message }, 'Update user failed');
      res.status(400).json({ success: false, error: { code: 'ERR_USER_UPDATE', message: error.message } });
    }
  }

  async delete(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const id = Number(req.params.id);
      logger.info({ userId, targetId: id }, 'Deleting user');

      await userService.delete(id);
      
      logger.info({ userId, targetId: id }, 'User deleted successfully');
      res.json({ success: true, data: null });
    } catch (error: any) {
      logger.error({ userId, targetId: req.params.id, error: error.message }, 'Delete user failed');
      res.status(400).json({ success: false, error: { code: 'ERR_USER_DELETE', message: error.message } });
    }
  }
}

export const userController = new UserController();
