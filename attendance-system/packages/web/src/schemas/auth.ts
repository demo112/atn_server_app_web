import { z } from 'zod';
import { UserRoleSchema } from './user';

export const LoginDtoSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名长度不能超过50个字符'),
  password: z.string().min(1, '密码不能为空').max(100, '密码长度不能超过100个字符'),
});

export const registerSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名长度不能超过50个字符'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码长度不能超过100个字符'),
  confirmPassword: z.string().min(1, '请确认密码').max(100, '密码长度不能超过100个字符'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export const LoginVoSchema = z.object({
  token: z.string().max(500),
  user: z.object({
    id: z.number(),
    username: z.string().max(50),
    role: UserRoleSchema,
    name: z.string().max(50).optional(),
    employeeId: z.number().optional(),
  }),
});