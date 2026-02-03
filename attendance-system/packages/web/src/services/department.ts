
import { api } from './api';
import { 
  DepartmentVO, 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  ApiResponse 
} from '@attendance/shared';

export const departmentService = {
  // 获取部门树
  getTree: (): Promise<ApiResponse<DepartmentVO[]>> => {
    return api.get<unknown, ApiResponse<DepartmentVO[]>>('/departments/tree');
  },

  // 获取部门详情
  getDepartment: (id: number): Promise<ApiResponse<DepartmentVO>> => {
    return api.get<unknown, ApiResponse<DepartmentVO>>(`/departments/${id}`);
  },

  // 创建部门
  createDepartment: (data: CreateDepartmentDto): Promise<ApiResponse<DepartmentVO>> => {
    return api.post<unknown, ApiResponse<DepartmentVO>>('/departments', data);
  },

  // 更新部门
  updateDepartment: (id: number, data: UpdateDepartmentDto): Promise<ApiResponse<DepartmentVO>> => {
    return api.put<unknown, ApiResponse<DepartmentVO>>(`/departments/${id}`, data);
  },

  // 删除部门
  deleteDepartment: (id: number): Promise<ApiResponse<void>> => {
    return api.delete<unknown, ApiResponse<void>>(`/departments/${id}`);
  }
};
