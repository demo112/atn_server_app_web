import { z } from 'zod';
import { UserRoleSchema } from './user';

export const LoginDtoSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const LoginVoSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    role: UserRoleSchema,
    name: z.string().optional(),
    employeeId: z.number().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

// MeVo requires permissions to be present
export const MeVoSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: UserRoleSchema,
  employeeId: z.number().optional(),
  permissions: z.array(z.string()),
});
