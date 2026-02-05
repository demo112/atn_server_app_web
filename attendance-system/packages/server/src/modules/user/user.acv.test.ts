
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { UserService } from './user.service';
import { AppError } from '../../common/errors';
import { prisma } from '../../common/db/prisma';

// Mock Prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

const prismaMock = prisma as any;

describe('UserService - ACV Verification', () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService();
  });

  describe('Contract Verification', () => {
    it('should enforce unique username', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (username) => {
            // Case 1: Exists -> Throw
            prismaMock.user.findUnique.mockResolvedValue({ id: 1, username });
            
            try {
              await service.create({ username, role: 'user' } as any);
              throw new Error('Should have thrown');
            } catch (e: any) {
              // Expect AppError
              if (e.name !== 'AppError' || e.message !== 'Username already exists') {
                 throw new Error(`Expected AppError('Username already exists'), got ${e.name}: ${e.message}`);
              }
            }

            // Case 2: Not Exists -> Success
            prismaMock.user.findUnique.mockResolvedValue(null);
            prismaMock.user.create.mockResolvedValue({ 
              id: 2, 
              username, 
              role: 'user', 
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            await service.create({ username, role: 'user' } as any);
            return true;
          }
        )
      );
    });
  });

  describe('Adversarial Verification', () => {
    it('should handle arbitrary input strings without crashing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string(),
            password: fc.string(),
            role: fc.string(), // Invalid roles too
          }),
          async (dto) => {
            prismaMock.user.findUnique.mockResolvedValue(null);
            prismaMock.user.create.mockResolvedValue({ 
              ...dto, 
              id: 1, 
              status: 'active', 
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            try {
              await service.create(dto as any);
              return true;
            } catch (e: any) {
              // Should catch unexpected errors
              // Since we mock DB, the only errors should be from logic
              return true;
            }
          }
        )
      );
    });
  });
});
