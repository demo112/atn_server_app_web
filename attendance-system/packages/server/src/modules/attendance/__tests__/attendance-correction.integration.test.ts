
import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { attendanceRouter } from '../attendance.routes';
import { prisma } from '../../../common/db/prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { CorrectionType, PrismaClient, AttendanceStatus } from '@prisma/client';

// Mock auth middleware
vi.mock('../../../common/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = {
      id: 999,
      employeeId: 100,
      role: 'admin',
      username: 'admin'
    };
    next();
  }
}));

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
    
    // Mock interactive transaction
    prismaMock.$transaction.mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(prismaMock);
      }
      return callback;
    });
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

  const mockCorrection = {
    id: 1,
    employeeId: 100,
    dailyRecordId: BigInt(1),
    type: CorrectionType.check_in,
    correctionTime: new Date('2024-02-01T09:00:00Z'),
    remark: 'Forgot',
    operatorId: 999,
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: { id: 100, name: 'John', department: { name: 'IT' } },
    dailyRecord: mockRecord,
    operator: { name: 'Admin' }
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

  describe('GET /corrections', () => {
    it('should return correction records', async () => {
      prismaMock.attCorrection.findMany.mockResolvedValue([mockCorrection] as any);
      prismaMock.attCorrection.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/attendance/corrections')
        .query({ page: 1, pageSize: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(1);
    });
  });

  describe('PUT /corrections/:id', () => {
    it('should update correction successfully', async () => {
      // Mock findUnique for permission check (if any) or initial fetch
      prismaMock.attCorrection.findUnique.mockResolvedValue(mockCorrection as any);
      // Mock update
      prismaMock.attCorrection.update.mockResolvedValue({
        ...mockCorrection,
        correctionTime: new Date('2024-02-01T09:30:00Z')
      } as any);

      // Mocks for recalculation
      prismaMock.attDailyRecord.findUnique.mockResolvedValue(mockRecord as any);
      prismaMock.attClockRecord.findMany.mockResolvedValue([]);
      prismaMock.attLeave.findMany.mockResolvedValue([]);
      prismaMock.attCorrection.findMany.mockResolvedValue([
        {
          ...mockCorrection,
          correctionTime: new Date('2024-02-01T09:30:00Z')
        }
      ] as any);
      prismaMock.attDailyRecord.update.mockResolvedValue({
        ...mockRecord,
        checkInTime: new Date('2024-02-01T09:30:00Z'),
        status: AttendanceStatus.late,
        lateMinutes: 30
      } as any);

      const res = await request(app)
        .put('/api/v1/attendance/corrections/1')
        .send({
          correctionTime: '2024-02-01T09:30:00Z',
          remark: 'Updated time'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /corrections/:id', () => {
    it('should delete correction successfully', async () => {
      // Mock findUnique for existence check
      prismaMock.attCorrection.findUnique.mockResolvedValue(mockCorrection as any);
      // Mock delete
      prismaMock.attCorrection.delete.mockResolvedValue(mockCorrection as any);

      // Mocks for recalculation (after deletion)
      prismaMock.attDailyRecord.findUnique.mockResolvedValue(mockRecord as any);
      prismaMock.attClockRecord.findMany.mockResolvedValue([]);
      prismaMock.attLeave.findMany.mockResolvedValue([]);
      // findMany returns empty to simulate no corrections left
      prismaMock.attCorrection.findMany.mockResolvedValue([] as any);
      // update daily record to reset status
      prismaMock.attDailyRecord.update.mockResolvedValue({
        ...mockRecord,
        checkInTime: null,
        status: AttendanceStatus.absent
      } as any);

      const res = await request(app)
        .delete('/api/v1/attendance/corrections/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
