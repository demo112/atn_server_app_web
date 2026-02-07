import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const ErrorSchema = z.object({
  code: z.string().max(50),
  message: z.string().max(200),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject<{
  success: z.ZodBoolean;
  data: z.ZodOptional<T>;
  pagination: z.ZodOptional<typeof PaginationSchema>;
  error: z.ZodOptional<typeof ErrorSchema>;
}> =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    pagination: PaginationSchema.optional(),
    error: ErrorSchema.optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T): z.ZodObject<{
  items: z.ZodArray<T>;
  total: z.ZodNumber;
  page: z.ZodNumber;
  pageSize: z.ZodNumber;
  totalPages: z.ZodNumber;
}> =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

export const QueryParamsSchema = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});