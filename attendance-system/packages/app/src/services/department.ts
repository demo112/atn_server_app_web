import request from '../utils/request';
import { ApiResponse, DepartmentVO, CreateDepartmentDto, UpdateDepartmentDto } from '@attendance/shared';

export const getDepartmentTree = () => {
  return request.get<any, ApiResponse<DepartmentVO[]>>('/departments/tree');
};

export const getDepartmentById = (id: number) => {
  return request.get<any, ApiResponse<DepartmentVO>>(`/departments/${id}`);
};

export const createDepartment = (data: CreateDepartmentDto) => {
  return request.post<any, ApiResponse<DepartmentVO>>('/departments', data);
};

export const updateDepartment = (id: number, data: UpdateDepartmentDto) => {
  return request.put<any, ApiResponse<DepartmentVO>>(`/departments/${id}`, data);
};

export const deleteDepartment = (id: number) => {
  return request.delete<any, ApiResponse<void>>(`/departments/${id}`);
};
