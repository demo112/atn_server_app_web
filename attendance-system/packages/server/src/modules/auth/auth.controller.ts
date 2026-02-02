import { Request, Response } from 'express';
import { authService } from './auth.service';
import { loginSchema } from './auth.dto';
import { createLogger } from '../../common/logger';

const logger = createLogger('auth');

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await authService.login(dto);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        logger.info({ userId: 'anonymous', errors: error.errors }, 'Login validation error');
        return res.status(400).json({ success: false, error: { code: 'ERR_VALIDATION', message: 'Validation failed' } });
      }
      
      const isAuthError = error.message === 'Invalid credentials' || error.message === 'Account is inactive';
      if (isAuthError) {
        return res.status(401).json({ success: false, error: { code: 'ERR_AUTH_FAILED', message: error.message } });
      }

      logger.error({ userId: 'anonymous', error: error.message, stack: error.stack }, 'Login unexpected error');
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
      logger.error({ userId: req.user?.id || 'unknown', error: error.message, stack: error.stack }, 'Me error');
      res.status(500).json({ success: false, error: { code: 'ERR_INTERNAL', message: 'Internal server error' } });
    }
  }
}

export const authController = new AuthController();
