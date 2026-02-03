import request, { validateResponse } from '../utils/request';
import { ApiResponse, EmployeeVo, CreateEmployeeDto, UpdateEmployeeDto, GetEmployeesDto, BindUserDto, PaginatedResponse } from '@attendance/shared';
import { EmployeeVoSchema, PaginatedEmployeeVoSchema } from '../schemas/employee';
import { z } from 'zod';

export const getEmployees = (params: GetEmployeesDto): Promise<PaginatedResponse<EmployeeVo>> => {
  return validateResponse(
    request.get<unknown, ApiResponse<PaginatedResponse<EmployeeVo>>>('/employees', { params }),
    PaginatedEmployeeVoSchema
  );
};

export const getEmployeeById = (id: number): Promise<EmployeeVo> => {
  return validateResponse(
    request.get<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`),
    EmployeeVoSchema
  );
};

export const createEmployee = (data: CreateEmployeeDto): Promise<EmployeeVo> => {
  return validateResponse(
    request.post<unknown, ApiResponse<EmployeeVo>>('/employees', data),
    EmployeeVoSchema
  );
};

export const updateEmployee = (id: number, data: UpdateEmployeeDto): Promise<EmployeeVo> => {
  return validateResponse(
    request.put<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`, data),
    EmployeeVoSchema
  );
};

export const deleteEmployee = (id: number): Promise<void> => {
  return validateResponse(
    request.delete<unknown, ApiResponse<void>>(`/employees/${id}`),
    z.void()
  );
};

export const bindUser = (id: number, data: BindUserDto): Promise<void> => {
  return validateResponse(
    request.post<unknown, ApiResponse<void>>(`/employees/${id}/bind-user`, data),
    z.void()
  );
};
