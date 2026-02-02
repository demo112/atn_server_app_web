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
  getLeaves: (params: LeaveQueryDto) => {
    return api.get<any, PaginatedResponse<LeaveVo>>('/attendance/leaves', { params });
  },

  // 创建
  createLeave: (data: CreateLeaveDto) => {
    return api.post<any, ApiResponse<LeaveVo>>('/attendance/leaves', data);
  },

  // 更新
  updateLeave: (id: number, data: UpdateLeaveDto) => {
    return api.put<any, ApiResponse<LeaveVo>>(`/attendance/leaves/${id}`, data);
  },

  // 撤销/删除
  cancelLeave: (id: number) => {
    return api.delete<any, ApiResponse<LeaveVo>>(`/attendance/leaves/${id}`);
  }
};
