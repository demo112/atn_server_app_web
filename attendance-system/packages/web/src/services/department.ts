
import { api } from './api';
import { 
  DepartmentVO, 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  ApiResponse 
} from '@attendance/shared';

export const departmentService = {
  // 获取部门树
  getTree: () => {
    return api.get<any, ApiResponse<DepartmentVO[]>>('/departments/tree');
  },

  // 获取部门详情
  getDepartment: (id: number) => {
    return api.get<any, ApiResponse<DepartmentVO>>(`/departments/${id}`);
  },

  // 创建部门
  createDepartment: (data: CreateDepartmentDto) => {
    return api.post<any, ApiResponse<DepartmentVO>>('/departments', data);
  },

  // 更新部门
  updateDepartment: (id: number, data: UpdateDepartmentDto) => {
    return api.put<any, ApiResponse<DepartmentVO>>(`/departments/${id}`, data);
  },

  // 删除部门
  deleteDepartment: (id: number) => {
    return api.delete<any, ApiResponse<void>>(`/departments/${id}`);
  }
};
