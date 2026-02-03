import request from '../utils/request';
import type { 
  GetUsersDto, 
  UserListVo, 
  CreateUserDto, 
  UpdateUserDto,
  User 
} from '@attendance/shared';

export const getUsers = (params?: GetUsersDto): Promise<UserListVo> => {
  return request.get<unknown, UserListVo>('/users', { params });
};

export const createUser = (data: CreateUserDto): Promise<User> => {
  return request.post<unknown, User>('/users', data);
};

export const updateUser = (id: number, data: UpdateUserDto): Promise<User> => {
  return request.patch<unknown, User>(`/users/${id}`, data);
};

export const deleteUser = (id: number): Promise<void> => {
  return request.delete<unknown, void>(`/users/${id}`);
};

export const getUser = (id: number): Promise<User> => {
  return request.get<unknown, User>(`/users/${id}`);
};
