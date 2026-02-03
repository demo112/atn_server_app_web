import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from '../../app';
import { prisma } from '../../common/db/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock logger
vi.mock('../../common/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
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
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('Auth API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashed_password',
        role: 'user',
        status: 'active',
        employeeId: null,
        employee: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(loginDto);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.username).toBe('testuser');
    });

    it('should fail with non-existent user', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'unknown', password: 'password' });

      // AuthService throws AppError.badRequest('Invalid credentials') -> 400
      expect(res.status).toBe(400); 
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Invalid credentials');
    });

    it('should fail with wrong password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashed_password',
        status: 'active',
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'testuser', password: 'wrong' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Invalid credentials');
    });

    it('should fail with inactive user', async () => {
       const mockUser = {
        id: 1,
        username: 'testuser',
        passwordHash: 'hashed_password',
        status: 'inactive',
      };
      
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'testuser', password: 'password' });
        
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Invalid credentials');
    });

    it('should reject extremely long username', async () => {
      const longUsername = 'a'.repeat(101);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: longUsername, password: 'password' });
      
      expect(res.status).toBe(400);
      // Zod validation error
      expect(res.body.success).toBe(false);
    });

    it('should validate input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: '', password: '' });

      expect(res.status).toBe(400); // Zod validation failure handled by middleware? Or crashing?
      // If using Zod parse in controller without try/catch or specific error handler, it might be 500 or 400.
      // Controller has try/catch throwing 'e'. Error handler should catch it.
      // ZodError usually mapped to 400.
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile', async () => {
        // We need a valid token to access this endpoint
        // Since we are mocking everything, we can just sign a token ourselves 
        // OR mock the auth middleware.
        // But integration tests usually test the middleware too.
        
        const token = jwt.sign(
            { id: 1, username: 'testuser', role: 'user' },
            process.env.JWT_SECRET || 'default-secret-key'
        );

        const mockUser = {
            id: 1,
            username: 'testuser',
            role: 'user',
            employee: { name: 'Test Employee' }
        };
        
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        const res = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.username).toBe('testuser');
    });

    it('should return 401 without token', async () => {
        const res = await request(app).get('/api/v1/auth/me');
        expect(res.status).toBe(401);
    });
  });
});
