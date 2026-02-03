import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'user']);
export const UserStatusSchema = z.enum(['active', 'inactive']);

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  employeeId: z.number().optional(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserDtoSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6).optional(),
  role: UserRoleSchema,
  employeeId: z.number().optional(),
});

export const UserListItemSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  employeeName: z.string().optional(),
  createdAt: z.string(),
});

export const UserListVoSchema = z.object({
  items: z.array(UserListItemSchema),
  total: z.number(),
});
