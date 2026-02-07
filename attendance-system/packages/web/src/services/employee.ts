import { api, validateResponse } from './api';
import { z } from 'zod';
import { 
  EmployeeVo, 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  BindUserDto,
  GetEmployeesDto,
  PaginatedResponse,
  ApiResponse 
} from '@attendance/shared';
import { EmployeeVoSchema, PaginatedEmployeeVoSchema } from '../schemas/employee';

export const employeeService = {
  // 获取员工列表
  getEmployees: async (params: GetEmployeesDto): Promise<PaginatedResponse<EmployeeVo>> => {
    const res = await api.get<unknown, ApiResponse<PaginatedResponse<EmployeeVo>>>('/employees', { params });
    return validateResponse(PaginatedEmployeeVoSchema, res);
  },

  // 获取单个员工
  getEmployee: async (id: number): Promise<EmployeeVo> => {
    const res = await api.get<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`);
    return validateResponse(EmployeeVoSchema, res);
  },

  // 创建员工
  createEmployee: async (data: CreateEmployeeDto): Promise<EmployeeVo> => {
    const res = await api.post<unknown, ApiResponse<EmployeeVo>>('/employees', data);
    return validateResponse(EmployeeVoSchema, res);
  },

  // 更新员工
  updateEmployee: async (id: number, data: UpdateEmployeeDto): Promise<EmployeeVo> => {
    const res = await api.put<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`, data);
    return validateResponse(EmployeeVoSchema, res);
  },

  // 删除员工
  deleteEmployee: async (id: number): Promise<void> => {
    const res = await api.delete<unknown, ApiResponse<{ id: number }>>(`/employees/${id}`);
    validateResponse(z.object({ id: z.number() }), res);
  },

  unbindUser: async (id: number): Promise<void> => {
    const res = await api.delete<unknown, ApiResponse<{ id: number }>>(`/employees/${id}/user`);
    validateResponse(z.object({ id: z.number() }), res);
  },

  // 绑定用户
  bindUser: async (id: number, data: BindUserDto): Promise<void> => {
    const res = await api.post<unknown, ApiResponse<void>>(`/employees/${id}/bind-user`, data);
    validateResponse(z.null(), res);
  }
};
