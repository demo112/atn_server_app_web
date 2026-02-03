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
  getEmployees: (params: GetEmployeesDto): Promise<ApiResponse<PaginatedResponse<EmployeeVo>>> => {
    return api.get<unknown, ApiResponse<PaginatedResponse<EmployeeVo>>>('/employees', { params });
  },

  // 获取单个员工
  getEmployee: (id: number): Promise<ApiResponse<EmployeeVo>> => {
    return api.get<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`);
  },

  // 创建员工
  createEmployee: (data: CreateEmployeeDto): Promise<ApiResponse<EmployeeVo>> => {
    return api.post<unknown, ApiResponse<EmployeeVo>>('/employees', data);
  },

  // 更新员工
  updateEmployee: (id: number, data: UpdateEmployeeDto): Promise<ApiResponse<EmployeeVo>> => {
    return api.put<unknown, ApiResponse<EmployeeVo>>(`/employees/${id}`, data);
  },

  // 删除员工
  deleteEmployee: (id: number): Promise<ApiResponse<void>> => {
    return api.delete<unknown, ApiResponse<void>>(`/employees/${id}`);
  },

  // 绑定用户
  bindUser: (id: number, data: BindUserDto): Promise<ApiResponse<void>> => {
    return api.post<unknown, ApiResponse<void>>(`/employees/${id}/bind-user`, data);
  }
};
