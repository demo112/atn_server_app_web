import request from '../utils/request';
import { 
  LeaveVo, 
  CreateLeaveDto, 
  LeaveQueryDto, 
  ApiResponse, 
  PaginatedResponse 
} from '@attendance/shared';

export const getLeaves = async (params: LeaveQueryDto): Promise<PaginatedResponse<LeaveVo>> => {
  return request.get<unknown, PaginatedResponse<LeaveVo>>('/attendance/leaves', { params });
};

export const createLeave = async (data: CreateLeaveDto): Promise<ApiResponse<LeaveVo>> => {
  return request.post<unknown, ApiResponse<LeaveVo>>('/attendance/leaves', data);
};

export const cancelLeave = async (id: number): Promise<ApiResponse<void>> => {
  return request.post<unknown, ApiResponse<void>>(`/attendance/leaves/${id}/cancel`);
};
