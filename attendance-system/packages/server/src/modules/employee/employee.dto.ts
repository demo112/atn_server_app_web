import { z } from 'zod';
import { QueryParamsSchema } from '@attendance/shared';

export const createEmployeeSchema = z.object({
  employeeNo: z.string().min(1, 'Employee No is required').max(50, 'Employee No must be less than 50 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  deptId: z.number().int().positive('Department is required'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  email: z.string().email().max(100, 'Email must be less than 100 characters').optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).max(100, 'Name must be less than 100 characters').optional(),
  deptId: z.number().int().positive().optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  email: z.string().email().max(100, 'Email must be less than 100 characters').optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const getEmployeesSchema = QueryParamsSchema.extend({
  keyword: z.string().optional(),
  deptId: z.coerce.number().int().positive().optional(),
});

export const bindUserSchema = z.object({
  userId: z.number().int().nullable(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type GetEmployeesInput = z.infer<typeof getEmployeesSchema>;
export type BindUserInput = z.infer<typeof bindUserSchema>;
