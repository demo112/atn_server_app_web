import { api, validateResponse } from './api';
import { ApiResponse, LeaveVo, CreateLeaveDto, LeaveQueryDto, LeaveType, LeaveStatus, PaginatedResponse } from '@attendance/shared';
import { z } from 'zod';

// Zod schemas for validation
const LeaveVoSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  type: z.nativeEnum(LeaveType),
  startTime: z.string().max(50),
  endTime: z.string().max(50),
  reason: z.string().max(200).nullable().optional(),
  status: z.nativeEnum(LeaveStatus),
  approverId: z.number().nullable().optional(),
  approvedAt: z.string().max(50).nullable().optional(),
  createdAt: z.string().max(50),
  updatedAt: z.string().max(50),
  employeeName: z.string().max(50).optional(),
  deptName: z.string().max(50).optional(),
  approverName: z.string().max(50).optional(),
});

export const getLeaves = async (query: LeaveQueryDto & { departmentId?: number }) => {
  // 转换参数类型，确保是数字
  const params = {
    ...query,
    employeeId: query.employeeId ? Number(query.employeeId) : undefined,
    departmentId: query.departmentId ? Number(query.departmentId) : undefined,
  };
  
  const res = await api.get<unknown, ApiResponse<PaginatedResponse<LeaveVo>>>('/leaves', { 
    params 
  });
  
  // 对于列表数据，我们信任后端返回，只做基本的结构检查
  if (!res.success) {
    throw new Error(res.error?.message || 'Failed to fetch leaves');
  }
  return res.data;
};

export const createLeave = async (data: CreateLeaveDto): Promise<LeaveVo> => {
  const res = await api.post<unknown, ApiResponse<LeaveVo>>('/leaves', data);
  return validateResponse(LeaveVoSchema, res) as unknown as LeaveVo;
};

export const updateLeave = async (id: number, data: Partial<CreateLeaveDto>): Promise<LeaveVo> => {
  const res = await api.put<unknown, ApiResponse<LeaveVo>>(`/leaves/${id}`, data);
  return validateResponse(LeaveVoSchema, res) as unknown as LeaveVo;
};

export const deleteLeave = async (id: number): Promise<void> => {
  const res = await api.delete<unknown, ApiResponse<{ id: number }>>(`/leaves/${id}`);
  validateResponse(z.object({ id: z.number() }), res);
};

export const cancelLeave = async (id: number, reason: string): Promise<LeaveVo> => {
  const res = await api.post<unknown, ApiResponse<LeaveVo>>(`/leaves/${id}/cancel`, { reason });
  return validateResponse(LeaveVoSchema, res) as unknown as LeaveVo;
};

export const approveLeave = async (id: number, comment?: string): Promise<LeaveVo> => {
  const res = await api.post<unknown, ApiResponse<LeaveVo>>(`/leaves/${id}/approve`, { comment });
  return validateResponse(LeaveVoSchema, res) as unknown as LeaveVo;
};

export const rejectLeave = async (id: number, comment: string): Promise<LeaveVo> => {
  const res = await api.post<unknown, ApiResponse<LeaveVo>>(`/leaves/${id}/reject`, { comment });
  return validateResponse(LeaveVoSchema, res) as unknown as LeaveVo;
};
