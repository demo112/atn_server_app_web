import { Request, Response } from 'express';
import { userService } from './user.service';
import { createUserSchema, updateUserSchema, getUsersSchema } from './user.dto';
import { logger } from '../../common/utils/logger';

export class UserController {
  async create(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const dto = createUserSchema.parse(req.body);
      logger.info('user', userId, 'Creating user', { username: dto.username, role: dto.role });
      
      const user = await userService.create(dto);
      
      logger.info('user', userId, 'User created successfully', { newUserId: user.id });
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      logger.error('user', userId, 'Create user failed', { error: error.message, stack: error.stack });
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
      logger.error('user', userId, 'Find users failed', { error: error.message, query: req.query });
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
      logger.warn('user', userId, 'User not found', { targetId: req.params.id, error: error.message });
      res.status(404).json({ success: false, error: { code: 'ERR_USER_NOT_FOUND', message: error.message } });
    }
  }

  async update(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const id = Number(req.params.id);
      const dto = updateUserSchema.parse(req.body);
      logger.info('user', userId, 'Updating user', { targetId: id, updates: Object.keys(dto) });

      const user = await userService.update(id, dto);
      
      logger.info('user', userId, 'User updated successfully', { targetId: id });
      res.json({ success: true, data: user });
    } catch (error: any) {
      logger.error('user', userId, 'Update user failed', { targetId: req.params.id, error: error.message });
      res.status(400).json({ success: false, error: { code: 'ERR_USER_UPDATE', message: error.message } });
    }
  }

  async delete(req: Request, res: Response) {
    const userId = (req as any).user?.id || 'system';
    try {
      const id = Number(req.params.id);
      logger.info('user', userId, 'Deleting user', { targetId: id });

      await userService.delete(id);
      
      logger.info('user', userId, 'User deleted successfully', { targetId: id });
      res.json({ success: true, data: null });
    } catch (error: any) {
      logger.error('user', userId, 'Delete user failed', { targetId: req.params.id, error: error.message });
      res.status(400).json({ success: false, error: { code: 'ERR_USER_DELETE', message: error.message } });
    }
  }
}

export const userController = new UserController();
