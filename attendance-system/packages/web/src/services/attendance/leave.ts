import { api } from '../api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  LeaveVo, 
  CreateLeaveDto, 
  UpdateLeaveDto, 
  LeaveQueryDto 
} from '@attendance/shared';

export const leaveService = {
  // 获取列表
  getLeaves: (params: LeaveQueryDto): Promise<PaginatedResponse<LeaveVo>> => {
    return api.get<unknown, PaginatedResponse<LeaveVo>>('/attendance/leaves', { params });
  },

  // 创建
  createLeave: (data: CreateLeaveDto): Promise<ApiResponse<LeaveVo>> => {
    return api.post<unknown, ApiResponse<LeaveVo>>('/attendance/leaves', data);
  },

  // 更新
  updateLeave: (id: number, data: UpdateLeaveDto): Promise<ApiResponse<LeaveVo>> => {
    return api.put<unknown, ApiResponse<LeaveVo>>(`/attendance/leaves/${id}`, data);
  },

  // 撤销/删除
  cancelLeave: (id: number): Promise<ApiResponse<LeaveVo>> => {
    return api.delete<unknown, ApiResponse<LeaveVo>>(`/attendance/leaves/${id}`);
  }
};
