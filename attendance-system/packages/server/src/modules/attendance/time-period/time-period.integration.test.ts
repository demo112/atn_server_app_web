
import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { attendanceRouter } from '../attendance.routes';
import { prisma } from '../../../common/db/prisma';
import { PrismaClient } from '@prisma/client';

// Mock prisma
vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

import { mockDeep, mockReset } from 'vitest-mock-extended';

// Mock auth middleware to skip token check
vi.mock('../../../common/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
// Mock auth middleware if needed, but TimePeriodController currently doesn't check user context explicitly
// (Assuming auth middleware is applied globally or higher up, but here we just test the route logic)
app.use('/api/v1/attendance', attendanceRouter);

describe('TimePeriod Integration', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('POST /time-periods', () => {
    it('should create a time period successfully', async () => {
      const dto = {
        name: 'Integration Test Shift',
        type: 0,
        startTime: '09:00',
        endTime: '18:00'
      };

      prismaMock.attTimePeriod.findFirst.mockResolvedValue(null);
      prismaMock.attTimePeriod.create.mockResolvedValue({
        id: 1,
        ...dto,
        restStartTime: null,
        restEndTime: null,
        rules: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app)
        .post('/api/v1/attendance/time-periods')
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(dto.name);
    });

    it('should fail validation with invalid time format', async () => {
      const dto = {
        name: 'Invalid Shift',
        type: 0,
        startTime: '25:00', // Invalid
        endTime: '18:00'
      };

      const res = await request(app)
        .post('/api/v1/attendance/time-periods')
        .send(dto);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ERR_VALIDATION_FAILED');
    });

    it('should fail if name exists', async () => {
      prismaMock.attTimePeriod.findFirst.mockResolvedValue({ id: 1 } as any);

      const res = await request(app)
        .post('/api/v1/attendance/time-periods')
        .send({
          name: 'Existing',
          type: 0,
          startTime: '09:00'
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ERR_ATT_PERIOD_NAME_EXISTS');
    });
  });

  describe('GET /time-periods', () => {
    it('should return list', async () => {
      prismaMock.attTimePeriod.findMany.mockResolvedValue([
        { id: 1, name: 'Shift 1', createdAt: new Date(), updatedAt: new Date() } as any,
        { id: 2, name: 'Shift 2', createdAt: new Date(), updatedAt: new Date() } as any
      ]);

      const res = await request(app).get('/api/v1/attendance/time-periods');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /time-periods/:id', () => {
    it('should return detail', async () => {
      prismaMock.attTimePeriod.findUnique.mockResolvedValue({
        id: 1,
        name: 'Shift 1',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app).get('/api/v1/attendance/time-periods/1');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('should return 404 if not found', async () => {
      prismaMock.attTimePeriod.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/v1/attendance/time-periods/999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /time-periods/:id', () => {
    it('should update successfully', async () => {
      prismaMock.attTimePeriod.findUnique.mockResolvedValue({ id: 1, name: 'Old' } as any);
      prismaMock.attTimePeriod.findFirst.mockResolvedValue(null);
      prismaMock.attTimePeriod.update.mockResolvedValue({
        id: 1,
        name: 'New',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      const res = await request(app)
        .put('/api/v1/attendance/time-periods/1')
        .send({ name: 'New' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New');
    });
  });

  describe('DELETE /time-periods/:id', () => {
    it('should delete successfully', async () => {
      prismaMock.attTimePeriod.findUnique.mockResolvedValue({ id: 1, name: 'Shift 1' } as any);
      prismaMock.attShiftPeriod.count.mockResolvedValue(0);
      prismaMock.attTimePeriod.delete.mockResolvedValue({ id: 1, name: 'Shift 1' } as any);

      const res = await request(app).delete('/api/v1/attendance/time-periods/1');

      expect(res.status).toBe(200);
    });

    it('should fail if in use', async () => {
      prismaMock.attTimePeriod.findUnique.mockResolvedValue({ id: 1, name: 'Shift 1' } as any);
      prismaMock.attShiftPeriod.count.mockResolvedValue(1);

      const res = await request(app).delete('/api/v1/attendance/time-periods/1');

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ERR_ATT_PERIOD_IN_USE');
    });
  });
});
