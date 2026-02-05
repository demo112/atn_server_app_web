import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { logger } from './logger';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    logger.warn({ code: 'VALIDATION_ERROR', path: req.path, errors: err.errors }, 'Validation failed');
    return res.status(400).json({
      success: false,
      error: { code: 'ERR_VALIDATION', message: 'Validation failed', details: err.errors }
    });
  }

  if (err instanceof AppError) {
    logger.warn({ code: err.code, path: req.path }, err.message);
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message }
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      logger.warn({ code: 'ERR_CONFLICT', path: req.path, target }, 'Unique constraint failed');
      return res.status(409).json({
        success: false,
        error: { code: 'ERR_CONFLICT', message: `${target} already exists` }
      });
    }
    // P2025: Record not found
    if (err.code === 'P2025') {
      logger.warn({ code: 'ERR_NOT_FOUND', path: req.path }, 'Record not found');
      return res.status(404).json({
        success: false,
        error: { code: 'ERR_NOT_FOUND', message: 'Record not found' }
      });
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    logger.error({ err, path: req.path }, 'Database connection failed');
    return res.status(503).json({
      success: false,
      error: { code: 'ERR_DB_CONNECTION', message: '服务暂时不可用(数据库连接失败)' }
    });
  }

  logger.error({ err, path: req.path }, '未处理异常');
  
  // 临时：写入错误到文件以便调试
  try {
    const fs = require('fs');
    const logPath = require('path').join(process.cwd(), 'server-error.log');
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.path}\n${err.stack || err}\n\n`;
    fs.appendFileSync(logPath, logEntry);
  } catch (e) {
    console.error('Failed to write error log', e);
  }

  return res.status(500).json({
    success: false,
    error: { code: 'ERR_INTERNAL', message: '服务器内部错误' }
  });
}
