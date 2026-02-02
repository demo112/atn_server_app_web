import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.dto';
import { logger } from '../../common/utils/logger';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await authService.login(dto);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        logger.info('auth', 'anonymous', 'Login validation error', { errors: error.errors });
        return res.status(400).json({ success: false, error: { code: 'ERR_VALIDATION', message: 'Validation failed' } });
      }
      
      const isAuthError = error.message === 'Invalid credentials' || error.message === 'Account is inactive';
      if (isAuthError) {
        return res.status(401).json({ success: false, error: { code: 'ERR_AUTH_FAILED', message: error.message } });
      }

      logger.error('auth', 'anonymous', 'Login unexpected error', { error: error.message, stack: error.stack });
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: 'Internal server error' } });
    }
  }

  async me(req: Request, res: Response) {
    try {
      // req.user is set by authMiddleware
      const userId = req.user!.id;
      const result = await authService.getMe(userId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      logger.error('auth', req.user?.id || 'unknown', 'Me error', { error: error.message, stack: error.stack });
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: 'Internal server error' } });
    }
  }
}

export const authController = new AuthController();
