import { z } from 'zod';
import { Department, DepartmentVO } from '@attendance/shared';

// Base Department Schema
// Note: explicit type annotation is required for recursive schemas
export const DepartmentSchema: z.ZodType<Department> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string().max(50),
    parentId: z.number().optional(),
    sortOrder: z.number(),
    children: z.array(DepartmentSchema).optional(),
    employeeCount: z.number().optional(),
  })
);

export const DepartmentVoSchema: z.ZodType<DepartmentVO> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string().max(50),
    parentId: z.number().nullable(),
    sortOrder: z.number(),
    createdAt: z.string().max(50),
    updatedAt: z.string().max(50),
    children: z.array(DepartmentVoSchema).optional(),
  })
);

export const CreateDepartmentDtoSchema = z.object({
  name: z.string().min(1).max(50, '部门名称不能超过50个字符'),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
});

export const UpdateDepartmentDtoSchema = z.object({
  name: z.string().min(1).max(50, '部门名称不能超过50个字符').optional(),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
});