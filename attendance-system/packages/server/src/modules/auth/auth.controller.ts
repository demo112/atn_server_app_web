import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.dto';
import { createLogger } from '../../common/logger';

const logger = createLogger('auth');

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info({ body: req.body }, 'Login request received');
      const dto = loginSchema.parse(req.body);
      logger.info('Login schema parsed');
      const result = await authService.login(dto);
      logger.info('Login service returned');
      res.json({ success: true, data: result });
    } catch (e) {
      logger.error({ err: e }, 'AuthController.login error');
      next(e);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      // req.user is set by authMiddleware
      const userId = (req as any).user!.id;
      const result = await authService.getMe(userId);
      res.json({ success: true, data: result });
    } catch (e) {
      logger.error({ err: e }, 'AuthController.me error');
      next(e);
    }
  }
}

export const authController = new AuthController();
