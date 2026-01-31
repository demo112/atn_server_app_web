import { api } from './api';
import { Employee, ApiResponse, PaginatedResponse } from '@attendance/shared';

export interface GetEmployeesParams {
  page?: number;
  pageSize?: number;
  deptId?: number;
  keyword?: string;
}

export const employeeService = {
  // 获取员工列表
  getEmployees: (params: GetEmployeesParams) => {
    return api.get<any, PaginatedResponse<Employee>>('/employees', { params });
  },

  // 获取单个员工
  getEmployee: (id: number) => {
    return api.get<any, ApiResponse<Employee>>(`/employees/${id}`);
  }
};
