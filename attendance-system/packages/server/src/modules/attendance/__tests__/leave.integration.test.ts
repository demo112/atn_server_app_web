
import 'reflect-metadata';
import 'express-async-errors';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { leaveRouter } from '../leave.routes';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient, LeaveStatus, LeaveType } from '@prisma/client';
import { errorHandler } from '../../../common/error-handler';

vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

vi.mock('../../../common/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  (req as any).user = {
    id: 1,
    employeeId: 101,
    role: 'user',
    username: 'test_user'
  };
  next();
});
app.use('/api/v1/leaves', leaveRouter);
app.use(errorHandler);

describe('Leave Integration', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('GET /leaves', () => {
    it('should return leave list', async () => {
      prismaMock.attLeave.count.mockResolvedValue(1);
      prismaMock.attLeave.findMany.mockResolvedValue([
        {
          id: 1,
          employeeId: 101,
          type: LeaveType.annual,
          startTime: new Date(),
          endTime: new Date(),
          status: LeaveStatus.approved,
          employee: { name: 'Test', department: { name: 'Dept' } }
        }
      ] as any);

      const res = await request(app).get('/api/v1/leaves');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
    });
  });

  describe('DELETE /leaves/:id', () => {
      it('should delete leave (admin only)', async () => {
          prismaMock.attLeave.findUnique.mockResolvedValue({
              id: 1,
              employeeId: 101,
              status: LeaveStatus.approved,
              startTime: new Date(),
              endTime: new Date()
          } as any);

          prismaMock.attLeave.delete.mockResolvedValue({
              id: 1
          } as any);
          
          const appAdmin = express();
          appAdmin.use(express.json());
          appAdmin.use((req, res, next) => {
              (req as any).user = { id: 1, role: 'admin', employeeId: 101 };
              next();
          });
          appAdmin.use('/api/v1/leaves', leaveRouter);
          appAdmin.use(errorHandler);

          const res = await request(appAdmin).delete('/api/v1/leaves/1');
          expect(res.status).toBe(200);
          expect(res.body.success).toBe(true);
          expect(prismaMock.attLeave.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      });
  });

  describe('POST /leaves/:id/cancel', () => {
      it('should cancel leave (admin only)', async () => {
          prismaMock.attLeave.findUnique.mockResolvedValue({
              id: 1,
              employeeId: 101,
              status: LeaveStatus.approved,
              startTime: new Date(),
              endTime: new Date()
          } as any);

          prismaMock.attLeave.update.mockResolvedValue({
              id: 1,
              status: LeaveStatus.cancelled
          } as any);
          
          const appAdmin = express();
          appAdmin.use(express.json());
          appAdmin.use((req, res, next) => {
              (req as any).user = { id: 1, role: 'admin', employeeId: 101 };
              next();
          });
          appAdmin.use('/api/v1/leaves', leaveRouter);
          appAdmin.use(errorHandler);

          const res = await request(appAdmin).post('/api/v1/leaves/1/cancel');
          expect(res.status).toBe(200);
          expect(res.body.success).toBe(true);
          expect(prismaMock.attLeave.update).toHaveBeenCalled();
      });
  });
});
