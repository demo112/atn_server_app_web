import request from '../utils/request';
import { ApiResponse, EmployeeVo, CreateEmployeeDto, UpdateEmployeeDto, GetEmployeesDto, BindUserDto } from '@attendance/shared';

export const getEmployees = (params: GetEmployeesDto): Promise<ApiResponse<{ items: EmployeeVo[], total: number }>> => {
  return request.get<unknown, ApiResponse<{ items: EmployeeVo[], total: number }>>('/employees', { params });
};

export const getEmployeeById = (id: number): Promise<ApiResponse<EmployeeVo>> => {
  return request.get<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`);
};

export const createEmployee = (data: CreateEmployeeDto): Promise<ApiResponse<EmployeeVo>> => {
  return request.post<unknown, ApiResponse<EmployeeVo>>('/employees', data);
};

export const updateEmployee = (id: number, data: UpdateEmployeeDto): Promise<ApiResponse<EmployeeVo>> => {
  return request.put<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`, data);
};

export const deleteEmployee = (id: number): Promise<ApiResponse<void>> => {
  return request.delete<unknown, ApiResponse<void>>(`/employees/${id}`);
};

export const bindUser = (id: number, data: BindUserDto): Promise<ApiResponse<void>> => {
  return request.post<unknown, ApiResponse<void>>(`/employees/${id}/bind-user`, data);
};
