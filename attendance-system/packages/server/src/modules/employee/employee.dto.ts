import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeNo: z.string().min(1, 'Employee No is required'),
  name: z.string().min(1, 'Name is required'),
  deptId: z.number().int().positive().optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  position: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  deptId: z.number().int().positive().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  position: z.string().optional(),
});

export const getEmployeesSchema = z.object({
  page: z.string().transform(Number).default('1'),
  pageSize: z.string().transform(Number).default('10'),
  keyword: z.string().optional(),
  deptId: z.string().transform(Number).optional(),
});

export const bindUserSchema = z.object({
  userId: z.number().int().nullable(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type GetEmployeesInput = z.infer<typeof getEmployeesSchema>;
export type BindUserInput = z.infer<typeof bindUserSchema>;
