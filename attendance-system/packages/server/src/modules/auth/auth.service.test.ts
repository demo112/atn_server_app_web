import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { prisma } from '../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(mockPrisma);
    service = new AuthService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user when credentials are valid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashed_password',
        role: 'user',
        status: 'active',
        employee: { name: 'Test Employee' }
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('mock_token');

      const result = await service.login({ username: 'testuser', password: 'password' });

      expect(result.token).toBe('mock_token');
      expect(result.user.id).toBe(1);
      expect(result.user.username).toBe('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed_password');
    });

    it('should return token and user when credentials are valid (phone login)', async () => {
      const mockUser = {
        id: 2,
        username: 'phone_user',
        passwordHash: 'hashed_password',
        role: 'user',
        status: 'active',
        employee: { name: 'Phone User', phone: '13800000000' }
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.findMany.mockResolvedValue([mockUser as any]);
      
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('mock_token_phone');

      const result = await service.login({ username: '13800000000', password: 'password' });

      expect(result.token).toBe('mock_token_phone');
      expect(result.user.username).toBe('phone_user');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: '13800000000' },
        include: { employee: true }
      });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { employee: { phone: '13800000000' } },
        include: { employee: true }
      });
    });

    it('should fail when multiple users share same phone', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 1, username: 'u1' },
        { id: 2, username: 'u2' }
      ] as any);

      await expect(service.login({ username: '13800000000', password: 'password' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ username: 'unknown', password: 'password' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error when password invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'testuser',
        passwordHash: 'hashed_password',
        status: 'active'
      } as any);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(service.login({ username: 'testuser', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw generic error when user inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'testuser',
        status: 'inactive'
      } as any);

      await expect(service.login({ username: 'testuser', password: 'password' }))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('getMe', () => {
    it('should return user info', async () => {
       mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'testuser',
        role: 'user',
        employee: { name: 'Test Employee' }
      } as any);

      const result = await service.getMe(1);
      expect(result.id).toBe(1);
      expect(result.username).toBe('testuser');
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMe(999)).rejects.toThrow('User not found');
    });
  });
});
