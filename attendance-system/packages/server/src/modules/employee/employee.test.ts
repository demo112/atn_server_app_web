import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeService } from './employee.service';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';
import { EmployeeStatus } from '@prisma/client';

// Mock prisma
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

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    // 由于 service 直接导出实例，这里我们手动实例化一个类来进行测试，
    // 或者我们需要 mock 模块导出的 service。
    // 但是 EmployeeService 类是导出的，所以我们可以 new 一个新的。
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create employee if not exists', async () => {
      const dto = { employeeNo: 'E001', name: 'Test' };
      (prisma.employee.findUnique as any).mockResolvedValue(null);
      (prisma.employee.create as any).mockResolvedValue({ ...dto, id: 1, status: 'active' });

      const result = await service.create(dto as any);
      expect(result).toBeDefined();
      expect(prisma.employee.create).toHaveBeenCalledWith({
        data: { ...dto, status: EmployeeStatus.active },
      });
    });

    it('should throw conflict if employee exists', async () => {
      const dto = { employeeNo: 'E001', name: 'Test' };
      (prisma.employee.findUnique as any).mockResolvedValue({ id: 1 });

      await expect(service.create(dto as any)).rejects.toThrow('Employee No already exists');
    });
  });

  describe('delete', () => {
    it('should soft delete employee', async () => {
      const employee = { id: 1, employeeNo: 'E001', status: 'active', userId: 100 };
      (prisma.employee.findUnique as any).mockResolvedValue(employee);
      (prisma.employee.update as any).mockResolvedValue({});
      (prisma.user.update as any).mockResolvedValue({});

      await service.delete(1);

      expect(prisma.$transaction).toHaveBeenCalled();
      // 验证 update 调用了 status: deleted
      const updateCall = (prisma.employee.update as any).mock.calls[0][0];
      expect(updateCall.data.status).toBe(EmployeeStatus.deleted);
      expect(updateCall.data.employeeNo).toMatch(/^del_/);
    });
  });
});
