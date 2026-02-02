
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { AuthService } from './auth.service';
import { AppError } from '../../common/errors';
import { prisma } from '../../common/db/prisma';

// Mock Prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

// Mock jwt
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_token'),
  },
}));

// Mock logger
vi.mock('../../common/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

const prismaMock = prisma as any;
import bcrypt from 'bcryptjs';

describe('AuthService - ACV Verification', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('Contract Verification', () => {
    it('login should succeed with valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          async (username, password) => {
            prismaMock.user.findUnique.mockResolvedValue({
              id: 1,
              username,
              passwordHash: 'hashed',
              status: 'active',
              role: 'user',
              employee: { name: 'Test' }
            });
            (bcrypt.compare as any).mockResolvedValue(true);

            const result = await service.login({ username, password });
            
            if (!result.token) throw new Error('Token missing');
            if (result.user.username !== username) throw new Error('Username mismatch');
            return true;
          }
        )
      );
    });

    it('login should fail with invalid credentials', async () => {
       prismaMock.user.findUnique.mockResolvedValue({
          id: 1,
          username: 'user',
          passwordHash: 'hashed',
          status: 'active',
       });
       (bcrypt.compare as any).mockResolvedValue(false);

       try {
         await service.login({ username: 'user', password: 'wrong' });
         throw new Error('Should have thrown');
       } catch (e: any) {
         if (e.name !== 'AppError' || e.message !== 'Invalid credentials') {
           throw new Error(`Expected AppError('Invalid credentials'), got ${e.name}: ${e.message}`);
         }
       }
    });
  });
});
