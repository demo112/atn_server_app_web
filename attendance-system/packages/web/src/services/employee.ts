import { api } from './api';
import { 
  EmployeeVo, 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  BindUserDto,
  GetEmployeesDto,
  PaginatedResponse,
  ApiResponse 
} from '@attendance/shared';

export const employeeService = {
  // 获取员工列表
  getEmployees: (params: GetEmployeesDto) => {
    return api.get<any, PaginatedResponse<EmployeeVo>>('/employees', { params });
  },

  // 获取单个员工
  getEmployee: (id: number) => {
    return api.get<any, EmployeeVo>(`/employees/${id}`);
  },

  // 创建员工
  createEmployee: (data: CreateEmployeeDto) => {
    return api.post<any, EmployeeVo>('/employees', data);
  },

  // 更新员工
  updateEmployee: (id: number, data: UpdateEmployeeDto) => {
    return api.put<any, EmployeeVo>(`/employees/${id}`, data);
  },

  // 删除员工
  deleteEmployee: (id: number) => {
    return api.delete<any, ApiResponse<void>>(`/employees/${id}`);
  },

  // 绑定用户
  bindUser: (id: number, data: BindUserDto) => {
    return api.post<any, ApiResponse<void>>(`/employees/${id}/bind-user`, data);
  }
};
