import { api, validateResponse } from './api';
import { z } from 'zod';
import { 
  User,
  CreateUserDto,
  UpdateUserDto,
  GetUsersDto,
  ApiResponse,
  UserListVo
} from '@attendance/shared';
import { UserSchema, UserListVoSchema } from '../schemas/user';

export const userService = {
  // 获取用户列表
  getUsers: async (params: GetUsersDto): Promise<UserListVo> => {
    const res = await api.get<unknown, ApiResponse<UserListVo>>('/users', { params });
    return validateResponse(UserListVoSchema, res);
  },

  // 获取单个用户
  getUser: async (id: number): Promise<User> => {
    const res = await api.get<unknown, ApiResponse<User>>(`/users/${id}`);
    return validateResponse(UserSchema, res) as User;
  },

  // 创建用户
  createUser: async (data: CreateUserDto): Promise<User> => {
    const res = await api.post<unknown, ApiResponse<User>>('/users', data);
    return validateResponse(UserSchema, res) as User;
  },

  // 更新用户
  updateUser: async (id: number, data: UpdateUserDto): Promise<User> => {
    const res = await api.put<unknown, ApiResponse<User>>(`/users/${id}`, data);
    return validateResponse(UserSchema, res) as User;
  },

  // 删除用户
  deleteUser: async (id: number): Promise<void> => {
    const res = await api.delete<unknown, ApiResponse<void>>(`/users/${id}`);
    validateResponse(z.null(), res);
  },
};
