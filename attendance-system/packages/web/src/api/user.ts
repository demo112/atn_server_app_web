import request from '../utils/request';
import type { 
  GetUsersDto, 
  UserListVo, 
  CreateUserDto, 
  UpdateUserDto,
  User 
} from '@attendance/shared';

export const getUsers = (params?: GetUsersDto) => {
  return request.get<any, UserListVo>('/users', { params });
};

export const createUser = (data: CreateUserDto) => {
  return request.post<any, User>('/users', data);
};

export const updateUser = (id: number, data: UpdateUserDto) => {
  return request.patch<any, User>(`/users/${id}`, data);
};

export const deleteUser = (id: number) => {
  return request.delete<any, void>(`/users/${id}`);
};

export const getUser = (id: number) => {
  return request.get<any, User>(`/users/${id}`);
};
