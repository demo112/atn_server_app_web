import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.dto';
import { createLogger } from '../../common/logger';

const logger = createLogger('auth');

export class AuthController {
  async login(req: Request, res: Response) {
    const dto = loginSchema.parse(req.body);
    const result = await authService.login(dto);
    res.json({ success: true, data: result });
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
