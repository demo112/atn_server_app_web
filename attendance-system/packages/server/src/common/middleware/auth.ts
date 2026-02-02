import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@attendance/shared';
import { logger } from '../utils/logger';

interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Info level for missing token as it might be public access attempt or error
    logger.info('auth', 'anonymous', 'Missing authorization header');
    return res.status(401).json({ 
      success: false, 
      error: { code: 'ERR_AUTH_MISSING_TOKEN', message: 'No token provided' } 
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.warn('auth', 'anonymous', 'Invalid token format', { header: authHeader });
    return res.status(401).json({ 
      success: false, 
      error: { code: 'ERR_AUTH_INVALID_TOKEN', message: 'Invalid token format' } 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('auth', 'anonymous', 'Token verification failed', { error: (error as Error).message });
    return res.status(401).json({ 
      success: false, 
      error: { code: 'ERR_AUTH_TOKEN_EXPIRED', message: 'Token expired or invalid' } 
    });
  }
};
