import request from '../utils/request';
import { ApiResponse, EmployeeVo, CreateEmployeeDto, UpdateEmployeeDto, GetEmployeesDto, BindUserDto } from '@attendance/shared';

export const getEmployees = (params: GetEmployeesDto) => {
  return request.get<any, ApiResponse<{ items: EmployeeVo[], total: number }>>('/employees', { params });
};

export const getEmployeeById = (id: number) => {
  return request.get<any, ApiResponse<EmployeeVo>>(`/employees/${id}`);
};

export const createEmployee = (data: CreateEmployeeDto) => {
  return request.post<any, ApiResponse<EmployeeVo>>('/employees', data);
};

export const updateEmployee = (id: number, data: UpdateEmployeeDto) => {
  return request.put<any, ApiResponse<EmployeeVo>>(`/employees/${id}`, data);
};

export const deleteEmployee = (id: number) => {
  return request.delete<any, ApiResponse<void>>(`/employees/${id}`);
};

export const bindUser = (id: number, data: BindUserDto) => {
  return request.post<any, ApiResponse<void>>(`/employees/${id}/bind-user`, data);
};
