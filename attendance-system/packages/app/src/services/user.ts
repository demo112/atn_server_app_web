import request, { validateResponse } from '../utils/request';
import { ApiResponse, UserListVo, CreateUserDto, UpdateUserDto, GetUsersDto, User } from '@attendance/shared';
import { UserListVoSchema, UserSchema } from '../schemas/user';
import { z } from 'zod';

export const getUsers = (params: GetUsersDto): Promise<UserListVo> => {
  return validateResponse(
    request.get<unknown, ApiResponse<UserListVo>>('/users', { params }),
    UserListVoSchema
  );
};

export const getUserById = (id: number): Promise<User> => {
  return validateResponse(
    request.get<unknown, ApiResponse<User>>(`/users/${id}`),
    UserSchema
  );
};

export const createUser = (data: CreateUserDto): Promise<User> => {
  return validateResponse(
    request.post<unknown, ApiResponse<User>>('/users', data),
    UserSchema
  );
};

export const updateUser = (id: number, data: UpdateUserDto): Promise<User> => {
  return validateResponse(
    request.put<unknown, ApiResponse<User>>(`/users/${id}`, data),
    UserSchema
  );
};

export const deleteUser = (id: number): Promise<void> => {
  return validateResponse(
    request.delete<unknown, ApiResponse<void>>(`/users/${id}`),
    z.void()
  );
};
