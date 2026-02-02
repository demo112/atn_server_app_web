import { api } from './api';
import { Schedule, ApiResponse, PaginatedResponse, CreateScheduleDto, BatchCreateScheduleDto, ScheduleQueryDto } from '@attendance/shared';

export const attendanceService = {
  // 获取排班列表
  getSchedules: (params: ScheduleQueryDto) => {
    return api.get<any, ApiResponse<Schedule[]>>('/attendance/schedules', { params });
  },

  // 创建单人排班
  createSchedule: (data: CreateScheduleDto) => {
    return api.post<any, ApiResponse<Schedule>>('/attendance/schedules', data);
  },

  // 批量创建排班
  batchCreateSchedule: (data: BatchCreateScheduleDto) => {
    return api.post<any, ApiResponse<{ count: number }>>('/attendance/schedules/batch', data);
  },

  // 获取班次列表
  getShifts: () => {
    return api.get<any, ApiResponse<any[]>>('/attendance/shifts');
  },

  // 删除排班
  deleteSchedule: (id: number) => {
    return api.delete<any, ApiResponse<void>>(`/attendance/schedules/${id}`);
  }
};
