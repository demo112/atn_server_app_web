import { z } from 'zod';
import { QueryParamsSchema } from '@attendance/shared';

export const createEmployeeSchema = z.object({
  employeeNo: z.string().min(1, 'Employee No is required'),
  name: z.string().min(1, 'Name is required'),
  deptId: z.number().int().positive('Department is required'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  deptId: z.number().int().positive().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
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
