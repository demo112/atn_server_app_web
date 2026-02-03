import { z } from 'zod';
import { EmployeeStatus } from '@attendance/shared';

// 员工状态枚举 Schema
export const EmployeeStatusSchema = z.nativeEnum(EmployeeStatus);

// 员工视图对象 Schema
export const EmployeeVoSchema = z.object({
  id: z.number(),
  employeeNo: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  deptId: z.number().nullable().optional(),
  deptName: z.string().optional(),
  status: EmployeeStatusSchema,
  hireDate: z.string().nullable().optional(),
  userId: z.number().nullable().optional(),
  username: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// 分页响应 Schema (通用泛型很难在 Zod 中直接定义，这里定义具体的 Employee 分页)
export const PaginatedEmployeeVoSchema = z.object({
  items: z.array(EmployeeVoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});