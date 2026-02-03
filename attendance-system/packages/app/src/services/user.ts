import request from '../utils/request';
import { ApiResponse, UserListVo, CreateUserDto, UpdateUserDto, GetUsersDto, User } from '@attendance/shared';

export const getUsers = (params: GetUsersDto): Promise<ApiResponse<UserListVo>> => {
  return request.get<unknown, ApiResponse<UserListVo>>('/users', { params });
};

export const getUserById = (id: number): Promise<ApiResponse<User>> => {
  return request.get<unknown, ApiResponse<User>>(`/users/${id}`);
};

export const createUser = (data: CreateUserDto): Promise<ApiResponse<User>> => {
  return request.post<unknown, ApiResponse<User>>('/users', data);
};

export const updateUser = (id: number, data: UpdateUserDto): Promise<ApiResponse<User>> => {
  return request.put<unknown, ApiResponse<User>>(`/users/${id}`, data);
};

export const deleteUser = (id: number): Promise<ApiResponse<void>> => {
  return request.delete<unknown, ApiResponse<void>>(`/users/${id}`);
};
