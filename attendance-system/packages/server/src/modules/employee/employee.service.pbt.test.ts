import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { EmployeeService } from './employee.service';
import { EmployeeStatus } from '@prisma/client';

// Mocks
const prismaEmployeeFindUnique = vi.fn();
const prismaEmployeeCreate = vi.fn();
const prismaEmployeeFindMany = vi.fn();
const prismaEmployeeCount = vi.fn();
const prismaEmployeeUpdate = vi.fn();
const prismaUserUpdate = vi.fn();
const prismaUserFindUnique = vi.fn();
const prismaTransaction = vi.fn();

vi.mock('../../common/db/prisma', () => ({
  prisma: {
    employee: {
      findUnique: (...args: any[]) => prismaEmployeeFindUnique(...args),
      create: (...args: any[]) => prismaEmployeeCreate(...args),
      findMany: (...args: any[]) => prismaEmployeeFindMany(...args),
      count: (...args: any[]) => prismaEmployeeCount(...args),
      update: (...args: any[]) => prismaEmployeeUpdate(...args),
    },
    user: {
      update: (...args: any[]) => prismaUserUpdate(...args),
      findUnique: (...args: any[]) => prismaUserFindUnique(...args),
    },
    $transaction: (args: any) => prismaTransaction(args),
  },
}));

describe('EmployeeService PBT', () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // Arbitraries
  const createEmployeeInputArb = fc.record({
    employeeNo: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    deptId: fc.integer({ min: 1 }),
    hireDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).map(d => d.toISOString().split('T')[0]),
    phone: fc.option(fc.string(), { nil: undefined }),
    email: fc.option(fc.emailAddress(), { nil: undefined }),
    position: fc.option(fc.string(), { nil: undefined }),
  });

  const mockEmployee = (dto: any, id: number) => ({
    id,
    ...dto,
    status: EmployeeStatus.active,
    createdAt: new Date(),
    updatedAt: new Date(),
    department: { name: 'Dept' },
    user: null,
  });

  it('should successfully create an employee if not exists', async () => {
    await fc.assert(
      fc.asyncProperty(createEmployeeInputArb, async (dto) => {
        // Setup
        prismaEmployeeFindUnique.mockResolvedValue(null);
        prismaEmployeeCreate.mockResolvedValue(mockEmployee(dto, 1));

        // Execute
        const result = await service.create(dto);

        // Verify
        expect(prismaEmployeeFindUnique).toHaveBeenCalledWith({ where: { employeeNo: dto.employeeNo } });
        expect(prismaEmployeeCreate).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            employeeNo: dto.employeeNo,
            status: EmployeeStatus.active,
          }),
        }));
        expect(result.employeeNo).toBe(dto.employeeNo);
      })
    );
  });

  it('should throw ERR_EMPLOYEE_EXISTS if employeeNo already exists', async () => {
    await fc.assert(
      fc.asyncProperty(createEmployeeInputArb, async (dto) => {
        // Setup
        prismaEmployeeFindUnique.mockResolvedValue(mockEmployee(dto, 1));

        // Execute & Verify
        await expect(service.create(dto)).rejects.toThrow(/Employee No already exists/);
      })
    );
  });

  it('should successfully delete an employee (soft delete)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1 }), fc.string(), async (id, employeeNo) => {
        // Setup
        const emp = { 
          id, 
          employeeNo, 
          status: EmployeeStatus.active, 
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        prismaEmployeeFindUnique.mockResolvedValue(emp);
        prismaTransaction.mockImplementation(async (args) => {
            // Simulate transaction execution if it's an array of promises or a function
            if (Array.isArray(args)) {
                return Promise.all(args);
            }
            return args; // In case logic changes
        });
        prismaEmployeeUpdate.mockResolvedValue({ ...emp, status: EmployeeStatus.deleted });

        // Execute
        await service.delete(id);

        // Verify
        expect(prismaTransaction).toHaveBeenCalled();
        // Since we pass an array of promises to $transaction, we verify the mocked update call
        expect(prismaEmployeeUpdate).toHaveBeenCalledWith(expect.objectContaining({
            where: { id },
            data: expect.objectContaining({
                status: EmployeeStatus.deleted
            })
        }));
      })
    );
  });
});
