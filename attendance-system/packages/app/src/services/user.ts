import request from '../utils/request';
import { ApiResponse, UserListVo, CreateUserDto, UpdateUserDto, GetUsersDto, User } from '@attendance/shared';

export const getUsers = (params: GetUsersDto) => {
  return request.get<any, ApiResponse<UserListVo>>('/users', { params });
};

export const getUserById = (id: number) => {
  return request.get<any, ApiResponse<User>>(`/users/${id}`);
};

export const createUser = (data: CreateUserDto) => {
  return request.post<any, ApiResponse<User>>('/users', data);
};

export const updateUser = (id: number, data: UpdateUserDto) => {
  return request.put<any, ApiResponse<User>>(`/users/${id}`, data);
};

export const deleteUser = (id: number) => {
  return request.delete<any, ApiResponse<void>>(`/users/${id}`);
};
