import { describe, it, expect } from 'vitest';
import { createEmployeeSchema, updateEmployeeSchema } from './employee.dto';

describe('createEmployeeSchema', () => {
  it('should validate valid data', () => {
    const data = {
      employeeNo: 'E001',
      name: 'Valid Name',
      deptId: 1,
      hireDate: '2023-01-01',
      phone: '13800138000',
      email: 'test@example.com'
    };
    const result = createEmployeeSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should fail if name is too long (>100)', () => {
    const data = {
      employeeNo: 'E001',
      name: 'a'.repeat(101),
      deptId: 1,
      hireDate: '2023-01-01'
    };
    const result = createEmployeeSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should fail if employeeNo is too long (>50)', () => {
    const data = {
      employeeNo: 'a'.repeat(51),
      name: 'Valid Name',
      deptId: 1,
      hireDate: '2023-01-01'
    };
    const result = createEmployeeSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('updateEmployeeSchema', () => {
    it('should fail if name is too long (>100)', () => {
        const data = {
          name: 'a'.repeat(101),
        };
        const result = updateEmployeeSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
});
