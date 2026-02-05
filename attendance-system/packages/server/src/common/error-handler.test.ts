import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { errorHandler } from './error-handler';

describe('errorHandler', () => {
  it('should handle PrismaClientInitializationError with 503', () => {
    const err = new Prisma.PrismaClientInitializationError(
      'Connection failed',
      'P1001',
      '2.0.0'
    );
    const req = { path: '/test' } as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;
    const next = vi.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'ERR_DB_CONNECTION', message: '服务暂时不可用(数据库连接失败)' }
    });
  });
});
