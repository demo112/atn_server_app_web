
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { prisma } from '../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../../common/errors';
import bcrypt from 'bcryptjs';

// Mock prisma
vi.mock('../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

describe('UserService', () => {
  let service: UserService;
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
    service = new UserService();
  });

  describe('create', () => {
    it('should create user with default password if not provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 1,
        username: 'newuser',
        passwordHash: 'hashed_password',
        role: 'user',
        status: 'active',
        employeeId: null,
      } as any);

      await service.create({ username: 'newuser', role: 'user' });

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
    });

    it('should throw AppError if username exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 1 } as any);
      
      await expect(service.create({ username: 'existing', role: 'user' }))
        .rejects.toThrow('Username already exists');
    });

    it('should throw friendly error if employeeId is already linked', async () => {
      // Setup: Username unique check passes
      prismaMock.user.findUnique.mockResolvedValue(null);
      
      // Setup: Create fails with Unique Constraint Violation on employeeId
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '4.0.0', meta: { target: ['employeeId'] } }
      );
      prismaMock.user.create.mockRejectedValue(error);

      await expect(service.create({ username: 'user2', role: 'user', employeeId: 99 }))
        .rejects.toThrow('Employee is already linked to a user');
    });
  });
});
