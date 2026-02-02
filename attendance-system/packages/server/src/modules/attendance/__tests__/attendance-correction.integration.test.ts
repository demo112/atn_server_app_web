
import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { attendanceRouter } from '../attendance.routes';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { CorrectionType, PrismaClient, AttendanceStatus } from '@prisma/client';

// Mock prisma
vi.mock('../../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

const app = express();
app.use(express.json());
// Mock user middleware
app.use((req, res, next) => {
  (req as any).user = {
    id: 999,
    employeeId: 100,
    role: 'admin',
    username: 'admin'
  };
  next();
});
app.use('/api/v1/attendance', attendanceRouter);

describe('Attendance Correction Integration', () => {
  const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockPeriod = {
    id: 1,
    startTime: '09:00',
    endTime: '18:00',
    rules: {} as any
  };

  const mockRecord = {
    id: BigInt(1),
    employeeId: 100,
    workDate: new Date('2024-02-01'),
    periodId: 1,
    period: mockPeriod,
    employee: { id: 100, name: 'John', department: { name: 'IT' } },
    shift: { name: 'Day' },
    checkInTime: null,
    checkOutTime: null,
    status: 'absent'
  };

  describe('POST /corrections/check-in', () => {
    it('should supplement check-in successfully', async () => {
      // Mock findUnique
      prismaMock.attDailyRecord.findUnique.mockResolvedValue(mockRecord as any);
      
      // Mock transaction
      prismaMock.$transaction.mockImplementation(async (callback) => {
        // Just execute the callback or simulate return
        // Since we can't easily execute the real callback with mocks inside, 
        // we mock the transaction result directly if we mocked the service call?
        // But here we are testing the controller -> service -> prisma flow.
        // The service calls prisma.$transaction([ update, create ]).
        // So prisma.$transaction receives an array of promises.
        // We should mock $transaction to return the resolved values of those promises.
        // But wait, in the service: await prisma.$transaction([ ... ])
        // So we just need $transaction to resolve with [updatedRecord, correction].
        return [
          { ...mockRecord, checkInTime: new Date('2024-02-01T09:00:00Z'), status: 'normal' },
          { id: 1, type: CorrectionType.check_in }
        ];
      });

      const res = await request(app)
        .post('/api/v1/attendance/corrections/check-in')
        .send({
          dailyRecordId: '1',
          checkInTime: '2024-02-01T09:00:00Z',
          remark: 'Forgot'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dailyRecord.checkInTime).toBe('2024-02-01T09:00:00.000Z');
    });

    it('should return 404 if record not found', async () => {
      prismaMock.attDailyRecord.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/attendance/corrections/check-in')
        .send({
          dailyRecordId: '999',
          checkInTime: '2024-02-01T09:00:00Z'
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ERR_RECORD_NOT_FOUND');
    });
  });

  describe('GET /daily', () => {
    it('should list daily records', async () => {
      prismaMock.attDailyRecord.findMany.mockResolvedValue([mockRecord] as any);
      prismaMock.attDailyRecord.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/attendance/daily')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(1);
      expect(res.body.data.items[0].id).toBe('1');
    });
  });
});
