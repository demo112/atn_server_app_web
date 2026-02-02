
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
    status: AttendanceStatus.absent,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    absentMinutes: 480
  };

  describe('GET /daily', () => {
    it('should return daily records', async () => {
      prismaMock.attDailyRecord.findMany.mockResolvedValue([mockRecord] as any);
      prismaMock.attDailyRecord.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/attendance/daily')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe('1');
    });
  });

  describe('POST /corrections/check-in', () => {
    it('should supplement check-in successfully', async () => {
      // Mock findUnique
      prismaMock.attDailyRecord.findUnique.mockResolvedValue(mockRecord as any);
      
      // Mock transaction
      prismaMock.$transaction.mockImplementation(async (callback) => {
        // Since service uses array of promises: await prisma.$transaction([ ... ])
        // We mock it to return array of results
        return [
          { 
            ...mockRecord, 
            checkInTime: new Date('2024-02-01T09:00:00Z'), 
            status: AttendanceStatus.normal,
            lateMinutes: 0,
            absentMinutes: 0
          },
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
      expect(res.body.data.dailyRecord.status).toBe('normal');
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
    });
  });

  describe('POST /corrections/check-out', () => {
    it('should supplement check-out successfully', async () => {
      const recordWithCheckIn = {
        ...mockRecord,
        checkInTime: new Date('2024-02-01T09:00:00Z'),
        status: AttendanceStatus.normal // Initial status
      };

      prismaMock.attDailyRecord.findUnique.mockResolvedValue(recordWithCheckIn as any);
      
      prismaMock.$transaction.mockImplementation(async () => {
        return [
          { 
            ...recordWithCheckIn, 
            checkOutTime: new Date('2024-02-01T18:00:00Z'), 
            status: AttendanceStatus.normal 
          },
          { id: 2, type: CorrectionType.check_out }
        ];
      });

      const res = await request(app)
        .post('/api/v1/attendance/corrections/check-out')
        .send({
          dailyRecordId: '1',
          checkOutTime: '2024-02-01T18:00:00Z',
          remark: 'Forgot out'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dailyRecord.checkOutTime).toBe('2024-02-01T18:00:00.000Z');
    });
  });
});
