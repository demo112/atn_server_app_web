import { z } from 'zod';
import { createPaginatedResponseSchema } from './common';

// Enums (align with Prisma/DB)
export const EmployeeStatusSchema = z.enum(['active', 'inactive', 'suspended', 'deleted']);

// Base Schema
export const EmployeeSchema = z.object({
  id: z.number().int(),
  employeeNo: z.string(),
  name: z.string(),
  deptId: z.number().int().nullable(),
  deptName: z.string().optional(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  status: EmployeeStatusSchema,
  hireDate: z.string().nullable(), // ISO Date string
  userId: z.number().int().nullable(),
  username: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Input Schemas
export const CreateEmployeeSchema = z.object({
  employeeNo: z.string().min(1, 'Employee No is required'),
  name: z.string().min(1, 'Name is required'),
  deptId: z.number().int().positive('Department is required'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  position: z.string().optional(),
});

export const UpdateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  deptId: z.number().int().positive().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  position: z.string().optional(),
  status: EmployeeStatusSchema.optional(),
});

export const GetEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  keyword: z.string().optional(),
  deptId: z.coerce.number().int().optional(),
});

export const BindUserSchema = z.object({
  userId: z.number().int().nullable(),
});

// Response Schemas
export const EmployeeResponseSchema = EmployeeSchema;
export const EmployeeListResponseSchema = createPaginatedResponseSchema(EmployeeSchema);

// Types
export type EmployeeFromSchema = z.infer<typeof EmployeeSchema>;
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
export type GetEmployeesQuery = z.infer<typeof GetEmployeesQuerySchema>;
export type BindUserInput = z.infer<typeof BindUserSchema>;
