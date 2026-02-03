
import { z } from 'zod';
import { api, validateResponse } from './api';
import { 
  DepartmentVO, 
  CreateDepartmentDto, 
  UpdateDepartmentDto, 
  ApiResponse 
} from '@attendance/shared';
import { DepartmentVoSchema } from '../schemas/department';

export const departmentService = {
  // 获取部门树
  getTree: async (): Promise<DepartmentVO[]> => {
    const res = await api.get<unknown, ApiResponse<DepartmentVO[]>>('/departments/tree');
    return validateResponse(z.array(DepartmentVoSchema), res);
  },

  // 获取部门详情
  getDepartment: async (id: number): Promise<DepartmentVO> => {
    const res = await api.get<unknown, ApiResponse<DepartmentVO>>(`/departments/${id}`);
    return validateResponse(DepartmentVoSchema, res);
  },

  // 创建部门
  createDepartment: async (data: CreateDepartmentDto): Promise<DepartmentVO> => {
    const res = await api.post<unknown, ApiResponse<DepartmentVO>>('/departments', data);
    return validateResponse(DepartmentVoSchema, res);
  },

  // 更新部门
  updateDepartment: async (id: number, data: UpdateDepartmentDto): Promise<DepartmentVO> => {
    const res = await api.put<unknown, ApiResponse<DepartmentVO>>(`/departments/${id}`, data);
    return validateResponse(DepartmentVoSchema, res);
  },

  // 删除部门
  deleteDepartment: async (id: number): Promise<void> => {
    const res = await api.delete<unknown, ApiResponse<void>>(`/departments/${id}`);
    return validateResponse(z.void(), res);
  }
};
