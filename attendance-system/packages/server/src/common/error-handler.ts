import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';
import { logger } from './logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn({ code: err.code, path: req.path }, err.message);
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message }
    });
  }

  logger.error({ err, path: req.path }, '未处理异常');
  return res.status(500).json({
    success: false,
    error: { code: 'ERR_INTERNAL', message: '服务器内部错误' }
  });
}
