
import 'reflect-metadata';
import 'express-async-errors';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { attendanceRouter } from '../attendance.routes';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from '../../../common/error-handler';

// Mock prisma
vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

// Mock auth middleware to skip token check
vi.mock('../../../common/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
// Mock user middleware
app.use((req, res, next) => {
  (req as any).user = {
    id: 1,
    employeeId: 101,
    role: 'admin', // Admin can create schedules
    username: 'admin_user'
  };
  next();
});
app.use('/api/v1/attendance', attendanceRouter);
app.use(errorHandler);

describe('Schedule Integration', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('POST /schedules', () => {
    it('should create a schedule successfully', async () => {
      // Mock validation queries
      prismaMock.employee.findUnique.mockResolvedValue({ id: 101 } as any);
      prismaMock.attShift.findUnique.mockResolvedValue({ id: 1 } as any);

      // Mock transaction
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(prismaMock);
      });

      // Mock conflict check (no conflict)
      prismaMock.attSchedule.findMany.mockResolvedValue([]);
      
      // Mock create return check (needed because create() fetches the result)
      prismaMock.attSchedule.findFirst.mockResolvedValue({
        id: 1,
        employeeId: 101,
        shiftId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
        employee: { id: 101, name: 'Test' },
        shift: { id: 1, name: 'Morning' }
      } as any);

      // Mock create
      prismaMock.attSchedule.create.mockResolvedValue({
        id: 1,
        employeeId: 101,
        shiftId: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/v1/attendance/schedules')
        .send({
          employeeId: 101,
          shiftId: 1,
          startDate: '2024-01-01',
          endDate: '2024-01-01',
          force: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prismaMock.attSchedule.create).toHaveBeenCalled();
    });

    it('should return 409 if conflict exists and force is false', async () => {
        // Mock validation
        prismaMock.employee.findUnique.mockResolvedValue({ id: 101 } as any);
        prismaMock.attShift.findUnique.mockResolvedValue({ id: 1 } as any);

        // Mock transaction
        prismaMock.$transaction.mockImplementation(async (callback) => {
            return callback(prismaMock);
        });

        // Mock conflict check (conflict exists)
        prismaMock.attSchedule.findMany.mockResolvedValue([{
            id: 2,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-01')
        }] as any);

        const res = await request(app)
            .post('/api/v1/attendance/schedules')
            .send({
                employeeId: 101,
                shiftId: 1,
                startDate: '2024-01-01',
                endDate: '2024-01-01',
                force: false
            });

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('ERR_SCHEDULE_CONFLICT');
    });
  });

  describe('GET /schedules', () => {
      it('should return schedules list', async () => {
          const mockSchedules = [
              { 
                  id: 1, 
                  employeeId: 101, 
                  shiftId: 1,
                  startDate: new Date('2024-01-01'),
                  endDate: new Date('2024-01-01'),
                  employee: { id: 101, name: 'Test' },
                  shift: { id: 1, name: 'Morning' }
              }
          ];
          prismaMock.attSchedule.findMany.mockResolvedValue(mockSchedules as any);

          const res = await request(app)
              .get('/api/v1/attendance/schedules')
              .query({ deptId: 1, startDate: '2024-01-01', endDate: '2024-01-31' });

          expect(res.status).toBe(200);
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(1);
      });
  });
});
