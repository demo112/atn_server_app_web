import request from '../utils/request';
import { validateResponse } from '../services/api';
import { z } from 'zod';
import type { 
  GetUsersDto, 
  UserListVo, 
  CreateUserDto, 
  UpdateUserDto,
  User 
} from '@attendance/shared';
import { UserListVoSchema, UserSchema } from '../schemas/user';
import { ApiResponse } from '@attendance/shared';

export const getUsers = async (params?: GetUsersDto): Promise<UserListVo> => {
  const res = await request.get<unknown, ApiResponse<UserListVo>>('/users', { params });
  return validateResponse(UserListVoSchema, res);
};

export const createUser = async (data: CreateUserDto): Promise<User> => {
  const res = await request.post<unknown, ApiResponse<User>>('/users', data);
  return validateResponse(UserSchema, res);
};

export const updateUser = async (id: number, data: UpdateUserDto): Promise<User> => {
  const res = await request.patch<unknown, ApiResponse<User>>(`/users/${id}`, data);
  return validateResponse(UserSchema, res);
};

export const deleteUser = async (id: number): Promise<void> => {
  const res = await request.delete<unknown, ApiResponse<void>>(`/users/${id}`);
  return validateResponse(z.void(), res);
};

export const getUser = async (id: number): Promise<User> => {
  const res = await request.get<unknown, ApiResponse<User>>(`/users/${id}`);
  return validateResponse(UserSchema, res);
};
