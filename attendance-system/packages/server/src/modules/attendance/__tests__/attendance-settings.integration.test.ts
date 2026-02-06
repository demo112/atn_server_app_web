
import 'reflect-metadata';
import 'express-async-errors';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { attendanceRouter } from '../attendance.routes';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { errorHandler } from '../../../common/error-handler';
import { PrismaClient } from '@prisma/client';

// Mock prisma
vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

// Mock auth middleware
vi.mock('../../../common/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
// Mock user
app.use((req, res, next) => {
  (req as any).user = {
    id: 1,
    role: 'admin',
    username: 'admin_user'
  };
  next();
});
app.use('/api/v1/attendance', attendanceRouter);
app.use(errorHandler);

describe('Attendance Settings Integration', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('GET /settings', () => {
    it('should return default settings when database is empty (AC: Story 1 & 2)', async () => {
      // Mock empty database
      prismaMock.attSetting.findMany.mockResolvedValue([]);

      const res = await request(app).get('/api/v1/attendance/settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Story 1 AC2: Default day_switch_time is "05:00"
      expect(res.body.data.day_switch_time).toBe('05:00'); 
      // Story 2 AC2: Return Key-Value format
      expect(res.body.data).toHaveProperty('day_switch_time');
    });

    it('should return stored settings (Story 2)', async () => {
      prismaMock.attSetting.findMany.mockResolvedValue([
        { key: 'day_switch_time', value: '06:00', description: 'desc', createdAt: new Date(), updatedAt: new Date() },
        { key: 'auto_calc_time', value: '02:00', description: 'desc', createdAt: new Date(), updatedAt: new Date() }
      ]);

      const res = await request(app).get('/api/v1/attendance/settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.day_switch_time).toBe('06:00');
      expect(res.body.data.auto_calc_time).toBe('02:00');
    });
  });

  describe('PUT /settings', () => {
    it('should update settings successfully (Story 3 AC1 & AC3)', async () => {
      // Mock findMany called by getSettings after update
      prismaMock.attSetting.findMany.mockResolvedValue([
        { key: 'day_switch_time', value: '07:00', description: 'desc', createdAt: new Date(), updatedAt: new Date() }
      ]);
      
      // Mock upsert
      prismaMock.attSetting.upsert.mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/v1/attendance/settings')
        .send({
          day_switch_time: '07:00'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.day_switch_time).toBe('07:00');
      
      // AC3: Persistence
      expect(prismaMock.attSetting.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: { key: 'day_switch_time' },
        update: { value: '07:00' }
      }));
    });

    it('should validate time format (HH:mm) - Invalid Hour (Story 3 AC2)', async () => {
      const res = await request(app)
        .put('/api/v1/attendance/settings')
        .send({
          day_switch_time: '25:00' // Invalid hour
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ERR_INVALID_TIME_FORMAT');
    });

    it('should validate time format (HH:mm) - Invalid Minute (Story 3 AC2)', async () => {
      const res = await request(app)
        .put('/api/v1/attendance/settings')
        .send({
          day_switch_time: '05:60' // Invalid minute
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ERR_INVALID_TIME_FORMAT');
    });
    
    it('should validate time format (HH:mm) - Garbage (Story 3 AC2)', async () => {
        const res = await request(app)
          .put('/api/v1/attendance/settings')
          .send({
            day_switch_time: 'abc'
          });
  
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error.code).toBe('ERR_INVALID_TIME_FORMAT');
      });
  });
});
