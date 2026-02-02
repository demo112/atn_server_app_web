
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { EmployeeService } from './employee.service';
import { AppError } from '../../common/errors';
import { EmployeeStatus } from '@prisma/client';
import { prisma } from '../../common/db/prisma';

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
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}));

// Type checking helper
const prismaMock = prisma as any;

describe('EmployeeService - ACV Verification', () => {
  let service: EmployeeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmployeeService();
  });

  describe('Contract Verification', () => {
    // Invariant: findAll should respect pageSize
    it('should respect pageSize invariant in findAll', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 100 }), // pageSize
          fc.integer({ min: 0, max: 200 }), // total items
          async (pageSize, totalItems) => {
            const mockItems = Array(Math.min(pageSize, totalItems)).fill({
              id: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
              status: EmployeeStatus.active,
              department: { name: 'Dept' },
              user: { id: 1, username: 'user' }
            });
            
            prismaMock.employee.findMany.mockResolvedValue(mockItems);
            prismaMock.employee.count.mockResolvedValue(totalItems);

            const result = await service.findAll({ page: 1, pageSize });
            
            if (result.items.length > pageSize) {
              throw new Error(`Returned ${result.items.length} items, expected <= ${pageSize}`);
            }
            if (result.pageSize !== pageSize) {
              throw new Error(`PageSize mismatch`);
            }
            return true;
          }
        )
      );
    });

    // Invariant: Unique Constraint on EmployeeNo
    it('should enforce uniqueness of employeeNo', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }),
          async (employeeNo) => {
            // Case 1: Exists -> Throw
            prismaMock.employee.findUnique.mockResolvedValue({ id: 1, employeeNo } as any);
            try {
              await service.create({ employeeNo, name: 'Test', phone: '123' } as any);
              throw new Error('Should have thrown conflict error');
            } catch (e: any) {
              // AppError uses statusCode
              const code = e.statusCode || e.httpCode || 500;
              if (e.name !== 'AppError' || code !== 409) {
                 throw new Error(`Expected AppError(409), got ${e.name}(${code}): ${e.message}`);
              }
            }

            // Case 2: Not Exists -> Success
            prismaMock.employee.findUnique.mockResolvedValue(null);
            prismaMock.employee.create.mockResolvedValue({ id: 2, employeeNo } as any);
            await service.create({ employeeNo, name: 'Test', phone: '123' } as any);
            
            return true;
          }
        )
      );
    });
  });

  describe('Adversarial Verification (Fuzzing)', () => {
    // Fuzz create method inputs
    it('should handle arbitrary input strings for create without crashing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            employeeNo: fc.string(),
            name: fc.string(),
            phone: fc.string(),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            deptId: fc.option(fc.integer({ min: 1 }), { nil: undefined }),
            hireDate: fc.option(fc.date(), { nil: undefined }),
          }),
          async (dto) => {
            prismaMock.employee.findUnique.mockResolvedValue(null);
            prismaMock.employee.create.mockResolvedValue({ ...dto, id: 1, status: EmployeeStatus.active } as any);

            try {
              await service.create(dto as any);
              return true;
            } catch (e: any) {
              const isAppError = e instanceof AppError || e.name === 'AppError';
              if (!isAppError) {
                console.error('Create failed with unexpected error:', e);
                // We want to catch unhandled errors. AppErrors are expected (e.g. validation).
                // If service does not validate input and DB throws, that might be an issue, 
                // but since we mock DB, we are testing service logic robustness.
                // If we pass garbage to prisma.create mock, it won't complain unless we add validation in service.
                // Let's assume service SHOULD validate critical fields.
                
                // If name is empty, it should probably throw BadRequest?
                // Currently code does NOT validate name emptiness explicitly, relies on DB?
                // Wait, if I pass empty string to Prisma, it saves empty string.
                // Let's see if it crashes.
                return false; 
              }
              return true;
            }
          }
        )
      );
    });
  });
});
