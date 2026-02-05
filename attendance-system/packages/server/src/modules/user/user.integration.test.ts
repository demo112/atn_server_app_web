import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from '../../app';
import { prisma } from '../../common/db/prisma';

process.env.JWT_SECRET = 'secret';


// Mock logger
vi.mock('../../common/logger', () => {
  const mockLogger = {
    info: vi.fn(), // Keep info silent to reduce noise
    error: vi.fn((msg, ...args) => console.error('[MOCK ERROR]', msg, ...args)),
    warn: vi.fn((msg, ...args) => console.warn('[MOCK WARN]', msg, ...args)),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  };
  return {
    logger: mockLogger,
    createLogger: vi.fn(() => mockLogger),
  };
});

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
    employee: {
        findUnique: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashed_password'),
        compare: vi.fn().mockResolvedValue(true),
    },
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
}));

describe('User API Integration', () => {
  const token = jwt.sign(
    { id: 1, username: 'admin', role: 'admin' },
    process.env.JWT_SECRET || 'secret'
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/users', () => {
    it('should create user successfully', async () => {
      const dto = {
        username: 'testuser',
        password: 'password123',
        role: 'user',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 2,
        username: dto.username,
        role: dto.role,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe(dto.username);
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should fail if validation fails', async () => {
        const dto = {
            username: 'ab', // Too short
            password: '123' // Too short
        };

        const res = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${token}`)
            .send(dto);

        expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/users', () => {
      it('should list users', async () => {
          (prisma.user.findMany as any).mockResolvedValue([
              { id: 1, username: 'admin', role: 'admin', createdAt: new Date(), status: 'active' },
              { id: 2, username: 'user', role: 'user', createdAt: new Date(), status: 'active' }
          ]);
          (prisma.user.count as any).mockResolvedValue(2);

          const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${token}`);

          expect(res.status).toBe(200);
          expect(res.body.data.items).toHaveLength(2);
      });

      it('should filter users by keyword', async () => {
        (prisma.user.findMany as any).mockResolvedValue([
            { id: 2, username: 'user', role: 'user', createdAt: new Date(), status: 'active' }
        ]);
        (prisma.user.count as any).mockResolvedValue(1);

        const res = await request(app)
          .get('/api/v1/users')
          .query({ keyword: 'user' })
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.items).toHaveLength(1);
        expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                OR: expect.arrayContaining([
                    expect.objectContaining({ username: { contains: 'user' } })
                ])
            })
        }));
      });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user successfully', async () => {
      const updateDto = { role: 'admin', status: 'inactive' };
      
      (prisma.user.update as any).mockResolvedValue({
        id: 2,
        username: 'testuser',
        role: 'admin',
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const res = await request(app)
        .put('/api/v1/users/2')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto);

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('admin');
      expect(res.body.data.status).toBe('inactive');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
          where: { id: 2 },
          data: expect.objectContaining(updateDto)
      }));
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user successfully', async () => {
      (prisma.user.delete as any).mockResolvedValue({ id: 2 });

      const res = await request(app)
        .delete('/api/v1/users/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 2 } });
    });
  });
});
