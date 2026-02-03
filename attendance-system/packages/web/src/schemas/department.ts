import { z } from 'zod';

// Base Department Schema
// Note: explicit type annotation is required for recursive schemas
export const DepartmentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    parentId: z.number().optional(),
    sortOrder: z.number(),
    children: z.array(DepartmentSchema).optional(),
    employeeCount: z.number().optional(),
  })
);

export const DepartmentVoSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    parentId: z.number().nullable(),
    sortOrder: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    children: z.array(DepartmentVoSchema).optional(),
  })
);

export const CreateDepartmentDtoSchema = z.object({
  name: z.string().min(1),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
});

export const UpdateDepartmentDtoSchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
});
