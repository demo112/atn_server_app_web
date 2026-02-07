import { z } from 'zod';
import { EmployeeStatus } from '@attendance/shared';

// 员工状态枚举 Schema
export const EmployeeStatusSchema = z.nativeEnum(EmployeeStatus);

// 员工视图对象 Schema
export const EmployeeVoSchema = z.object({
  id: z.number(),
  employeeNo: z.string().max(20),
  name: z.string().max(50),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().max(100).nullable().optional(),
  deptId: z.number().nullable().optional(),
  deptName: z.string().max(50).optional(),
  status: EmployeeStatusSchema,
  hireDate: z.string().max(50).nullable().optional(),
  userId: z.number().nullable().optional(),
  username: z.string().max(50).nullable().optional(),
  createdAt: z.string().max(50),
  updatedAt: z.string().max(50),
});

// 分页响应 Schema (通用泛型很难在 Zod 中直接定义，这里定义具体的 Employee 分页)
export const PaginatedEmployeeVoSchema = z.object({
  items: z.array(EmployeeVoSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});
