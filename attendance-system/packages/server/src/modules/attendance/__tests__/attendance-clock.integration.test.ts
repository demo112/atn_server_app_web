
import 'reflect-metadata';
import 'express-async-errors'; // Import async errors handling
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { attendanceRouter } from '../attendance.routes';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ClockType, ClockSource, PrismaClient } from '@prisma/client';
import { errorHandler } from '../../../common/error-handler'; // Import global error handler

// Mock prisma
vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

// Mock auth middleware to skip token check and use mocked req.user
vi.mock('../../../common/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => next(),
}));

const app = express();
app.use(express.json());
// Mock user middleware for authentication
app.use((req, res, next) => {
  // Default mock user
  (req as any).user = {
    id: 1,
    employeeId: 101,
    role: 'user',
    username: 'test_user'
  };
  next();
});
app.use('/api/v1/attendance', attendanceRouter);
app.use(errorHandler); // Register error handler

describe('Attendance Clock Integration', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
    // Mock transaction to execute callback immediately
    // @ts-ignore
    prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock));
  });

  describe('POST /clock (App)', () => {
    it('should create a clock-in record for app user', async () => {
      // Mock employee check
      prismaMock.employee.findUnique.mockResolvedValue({
        id: 101,
        name: 'Test Employee',
        deptId: 1,
      } as any);

      // Mock creation
      prismaMock.attClockRecord.create.mockResolvedValue({
        id: BigInt(1),
        employeeId: 101,
        clockTime: new Date(),
        type: ClockType.sign_in,
        source: ClockSource.app,
        deviceInfo: { model: 'iPhone' },
        location: { lat: 30, lng: 120 },
        operatorId: null,
        remark: null,
        createdAt: new Date(),
        employee: { name: 'Test Employee', department: { name: 'Tech' } },
        operator: null
      } as any);

      const res = await request(app)
        .post('/api/v1/attendance/clock')
        .send({
          type: 'sign_in',
          source: 'app',
          deviceInfo: { model: 'iPhone' },
          location: { lat: 30, lng: 120 }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.source).toBe('app');
      expect(prismaMock.employee.findUnique).toHaveBeenCalledWith({ where: { id: 101 } });
    });

    it('should fail if user has no employee linked', async () => {
      // Override middleware for this test to simulate user without employeeId
      const appNoEmp = express();
      appNoEmp.use(express.json());
      appNoEmp.use((req, res, next) => {
        (req as any).user = { id: 2, role: 'admin' }; // No employeeId
        next();
      });
      appNoEmp.use('/api/v1/attendance', attendanceRouter);
      appNoEmp.use(errorHandler); // Register error handler

      const res = await request(appNoEmp)
        .post('/api/v1/attendance/clock')
        .send({
          type: 'sign_in',
          source: 'app'
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('ERR_AUTH_NO_EMPLOYEE');
    });
  });

  describe('POST /clock (Web)', () => {
    it('should create a clock-in record for web operator', async () => {
      // Mock operator check
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'test_user'
      } as any);

      prismaMock.employee.findUnique.mockResolvedValue({
        id: 102,
        name: 'Target Employee',
      } as any);

      prismaMock.attClockRecord.create.mockResolvedValue({
        id: BigInt(2),
        employeeId: 102,
        clockTime: new Date('2023-01-01T09:00:00Z'),
        type: ClockType.sign_in,
        source: ClockSource.web,
        deviceInfo: null,
        location: null,
        operatorId: 1, // Current user
        remark: 'Manual entry',
        createdAt: new Date(),
        employee: { name: 'Target Employee', department: null },
        operator: { username: 'test_user' }
      } as any);

      const res = await request(app)
        .post('/api/v1/attendance/clock')
        .send({
          employeeId: 102,
          clockTime: '2023-01-01T09:00:00Z',
          type: 'sign_in',
          source: 'web',
          remark: 'Manual entry'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.source).toBe('web');
      expect(res.body.data.operatorId).toBe(1);
    });

    it('should fail with 401 if operator user does not exist', async () => {
      // Mock operator check returning null (user not found)
      prismaMock.user.findUnique.mockResolvedValue(null);

      prismaMock.employee.findUnique.mockResolvedValue({
        id: 102,
        name: 'Target Employee',
      } as any);

      const res = await request(app)
        .post('/api/v1/attendance/clock')
        .send({
          employeeId: 102,
          clockTime: '2023-01-01T09:00:00Z',
          type: 'sign_in',
          source: 'web',
          remark: 'Manual entry'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('ERR_AUTH_INVALID_TOKEN');
    });

    it('should fail if employeeId is missing for web source', async () => {
      const res = await request(app)
        .post('/api/v1/attendance/clock')
        .send({
          type: 'sign_in',
          source: 'web'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ERR_PARAM_MISSING');
    });
  });

  describe('GET /clock', () => {
    it('should return paginated list', async () => {
      prismaMock.attClockRecord.count.mockResolvedValue(1);
      prismaMock.attClockRecord.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          employeeId: 101,
          clockTime: new Date(),
          type: ClockType.sign_in,
          source: ClockSource.app,
          deviceInfo: null,
          location: null,
          operatorId: null,
          remark: null,
          createdAt: new Date(),
          employee: { name: 'Test Employee', department: null },
          operator: null
        }
      ] as any);

      const res = await request(app)
        .get('/api/v1/attendance/clock')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });

    it('should enforce permission: regular user only sees own records', async () => {
        // Default mock user is role 'user' and employeeId 101
        prismaMock.attClockRecord.count.mockResolvedValue(0);
        prismaMock.attClockRecord.findMany.mockResolvedValue([]);

        await request(app).get('/api/v1/attendance/clock');

        // Check that where clause included employeeId: 101
        expect(prismaMock.attClockRecord.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    employeeId: 101
                })
            })
        );
    });
  });
});
