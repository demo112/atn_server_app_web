import { z } from 'zod';
// UserRole and UserStatus are types in shared, so we use string literals for runtime validation
// import { UserRole, UserStatus } from '@attendance/shared';

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['admin', 'user']).default('user'),
  employeeId: z.number().optional(),
});

export const updateUserSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  password: z.string().min(6).optional(),
  employeeId: z.number().optional(),
});

export const getUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
  keyword: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersInput = z.infer<typeof getUsersSchema>;
