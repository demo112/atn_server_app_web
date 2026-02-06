import { api, validateResponse } from './api';
import { z } from 'zod';
import { 
  LeaveVo, 
  CreateLeaveDto, 
  LeaveQueryDto, 
  ApiResponse, 
  PaginatedResponse 
} from '@attendance/shared';
import { PaginatedLeaveVoSchema, LeaveVoSchema } from '../schemas/attendance';

export const getLeaves = async (params: LeaveQueryDto): Promise<PaginatedResponse<LeaveVo>> => {
  const res = await api.get<unknown, ApiResponse<PaginatedResponse<LeaveVo>>>('/leaves', { params });
  return validateResponse(PaginatedLeaveVoSchema, res);
};

export const createLeave = async (data: CreateLeaveDto): Promise<LeaveVo> => {
  const res = await api.post<unknown, ApiResponse<LeaveVo>>('/leaves', data);
  return validateResponse(LeaveVoSchema, res);
};

export const cancelLeave = async (id: number): Promise<void> => {
  const res = await api.delete<unknown, ApiResponse<void>>(`/leaves/${id}`);
  return validateResponse(z.void(), res);
};
