import fc from 'fast-check';
import { EmployeeVoSchema, PaginatedEmployeeVoSchema } from '../employee';
import { EmployeeStatus } from '@attendance/shared';

describe('Employee Schemas Property Tests', () => {
  const employeeVoArb = fc.record({
    id: fc.integer(),
    employeeNo: fc.string(),
    name: fc.string(),
    phone: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
    email: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
    deptId: fc.oneof(fc.integer(), fc.constant(null), fc.constant(undefined)),
    deptName: fc.oneof(fc.string(), fc.constant(undefined)),
    status: fc.constantFrom(...Object.values(EmployeeStatus)),
    hireDate: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
    userId: fc.oneof(fc.integer(), fc.constant(null), fc.constant(undefined)),
    username: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
    createdAt: fc.string(),
    updatedAt: fc.string(),
  });

  test('EmployeeVoSchema should validate correct structures', () => {
    fc.assert(
      fc.property(employeeVoArb, (emp) => {
        const result = EmployeeVoSchema.safeParse(emp);
        expect(result.success).toBe(true);
      })
    );
  });

  test('PaginatedEmployeeVoSchema should validate correct structures', () => {
    const paginatedArb = fc.record({
      items: fc.array(employeeVoArb),
      total: fc.integer({ min: 0 }),
      page: fc.integer({ min: 1 }),
      pageSize: fc.integer({ min: 1 }),
      totalPages: fc.integer({ min: 0 }),
    });

    fc.assert(
      fc.property(paginatedArb, (page) => {
        const result = PaginatedEmployeeVoSchema.safeParse(page);
        expect(result.success).toBe(true);
      })
    );
  });
});
