import request from '../utils/request';
import { 
  LeaveVo, 
  CreateLeaveDto, 
  LeaveQueryDto, 
  ApiResponse, 
  PaginatedResponse 
} from '@attendance/shared';

export const getLeaves = async (params: LeaveQueryDto) => {
  return request.get<any, PaginatedResponse<LeaveVo>>('/attendance/leaves', { params });
};

export const createLeave = async (data: CreateLeaveDto) => {
  return request.post<any, ApiResponse<LeaveVo>>('/attendance/leaves', data);
};

export const cancelLeave = async (id: number) => {
  return request.post<any, ApiResponse<void>>(`/attendance/leaves/${id}/cancel`);
};
