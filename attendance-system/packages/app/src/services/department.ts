import request, { validateResponse } from '../utils/request';
import { ApiResponse, DepartmentVO, CreateDepartmentDto, UpdateDepartmentDto } from '@attendance/shared';
import { DepartmentVoSchema } from '../schemas/department';
import { z } from 'zod';

export const getDepartmentTree = (): Promise<DepartmentVO[]> => {
  return validateResponse(
    request.get<any, ApiResponse<DepartmentVO[]>>('/departments/tree'),
    z.array(DepartmentVoSchema)
  );
};

export const getDepartmentById = (id: number): Promise<DepartmentVO> => {
  return validateResponse(
    request.get<any, ApiResponse<DepartmentVO>>(`/departments/${id}`),
    DepartmentVoSchema
  );
};

export const createDepartment = (data: CreateDepartmentDto): Promise<DepartmentVO> => {
  return validateResponse(
    request.post<any, ApiResponse<DepartmentVO>>('/departments', data),
    DepartmentVoSchema
  );
};

export const updateDepartment = (id: number, data: UpdateDepartmentDto): Promise<DepartmentVO> => {
  return validateResponse(
    request.put<any, ApiResponse<DepartmentVO>>(`/departments/${id}`, data),
    DepartmentVoSchema
  );
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await validateResponse(
    request.delete<any, ApiResponse<{ id: number }>>(`/departments/${id}`),
    z.object({ id: z.number() })
  );
};
