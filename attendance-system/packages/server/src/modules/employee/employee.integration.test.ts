import request from 'supertest';
import jwt from 'jsonwebtoken';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from '../../app'; // We exported this earlier
import { prisma } from '../../common/db/prisma';
import { EmployeeStatus } from '@prisma/client';

// Mock logger
vi.mock('../../common/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn((msg, ...args) => console.error('[MOCK ERROR]', msg, ...args)),
    warn: vi.fn((msg, ...args) => console.warn('[MOCK WARN]', msg, ...args)),
    debug: vi.fn(),
  };
  return {
    logger: mockLogger,
    createLogger: vi.fn().mockReturnValue(mockLogger),
  };
});

// Mock Prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}));

describe('Employee API Integration', () => {
  const token = jwt.sign(
    { id: 1, username: 'admin', role: 'admin' },
    process.env.JWT_SECRET || 'secret'
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/employees', () => {
    it('should create employee successfully', async () => {
      const dto = {
        employeeNo: 'E999',
        name: 'Integration Test',
        deptId: 1,
        hireDate: '2023-01-01',
      };

      (prisma.employee.findUnique as any).mockResolvedValue(null);
      (prisma.employee.create as any).mockResolvedValue({
        id: 1,
        ...dto,
        status: EmployeeStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(dto.name);
      expect(prisma.employee.create).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      const dto = {
        name: 'Missing No', // Missing employeeNo
      };

      const res = await request(app)
        .post('/api/v1/employees')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('should soft delete employee', async () => {
      const employee = { 
        id: 1, 
        employeeNo: 'E999', 
        status: 'active', 
        userId: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        hireDate: new Date(),
      };
      (prisma.employee.findUnique as any).mockResolvedValue(employee);
      (prisma.employee.update as any).mockResolvedValue({ ...employee, status: 'deleted' });

      const res = await request(app)
        .delete('/api/v1/employees/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Verify soft delete logic in service was triggered
      expect(prisma.$transaction).toHaveBeenCalled();
      const updateCall = (prisma.employee.update as any).mock.calls[0][0];
      expect(updateCall.data.status).toBe(EmployeeStatus.deleted);
      expect(updateCall.data.employeeNo).toMatch(/^del_/);
    });
  });

  describe('GET /api/v1/employees', () => {
    it('should return list of employees', async () => {
      (prisma.employee.findMany as any).mockResolvedValue([
        { id: 1, name: 'Emp1', status: 'active', createdAt: new Date(), updatedAt: new Date(), hireDate: new Date() },
        { id: 2, name: 'Emp2', status: 'active', createdAt: new Date(), updatedAt: new Date(), hireDate: new Date() },
      ]);
      (prisma.employee.count as any).mockResolvedValue(2);

      const res = await request(app)
        .get('/api/v1/employees')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
    });
  });
});
