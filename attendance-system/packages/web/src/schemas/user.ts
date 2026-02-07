import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'user']);
export const UserStatusSchema = z.enum(['active', 'inactive']);

export const UserSchema = z.object({
  id: z.number(),
  username: z.string().max(50),
  employeeId: z.number().nullable().optional(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.string().max(50),
  updatedAt: z.string().max(50),
});

export const CreateUserDtoSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(6).max(100).optional(),
  role: UserRoleSchema,
  employeeId: z.number().optional(),
});

export const UserListItemSchema = z.object({
  id: z.number(),
  username: z.string().max(50),
  role: UserRoleSchema,
  status: UserStatusSchema,
  employeeName: z.string().max(50).optional(),
  createdAt: z.string().max(50),
});

export const UserListVoSchema = z.object({
  items: z.array(UserListItemSchema),
  total: z.number(),
});
