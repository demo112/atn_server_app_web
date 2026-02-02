import { authMiddleware } from './auth';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: any;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should return 401 if no authorization header', () => {
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ code: 'ERR_AUTH_MISSING_TOKEN' })
    }));
  });

  it('should return 401 if token format is invalid', () => {
    req.headers = { authorization: 'InvalidFormat' };
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ code: 'ERR_AUTH_INVALID_TOKEN' })
    }));
  });

  it('should return 401 if token is expired/invalid', () => {
    req.headers = { authorization: 'Bearer invalidtoken' };
    (jwt.verify as any).mockImplementation(() => { throw new Error('Expired'); });

    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({ code: 'ERR_AUTH_TOKEN_EXPIRED' })
    }));
  });

  it('should call next if token is valid', () => {
    req.headers = { authorization: 'Bearer validtoken' };
    (jwt.verify as any).mockReturnValue({ id: 1, role: 'user' });

    authMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toBeDefined();
  });
});
