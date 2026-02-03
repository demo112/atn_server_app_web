import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(100, 'Username is too large'),
  password: z.string().min(1, 'Password is required').max(100, 'Password is too large'),
});

export type LoginInput = z.infer<typeof loginSchema>;
