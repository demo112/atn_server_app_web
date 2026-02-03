import { api } from './api';
import { Schedule, ApiResponse, CreateScheduleDto, BatchCreateScheduleDto, ScheduleQueryDto } from '@attendance/shared';

export const attendanceService = {
  // 获取排班列表
  getSchedules: (params: ScheduleQueryDto): Promise<ApiResponse<Schedule[]>> => {
    return api.get<unknown, ApiResponse<Schedule[]>>('/attendance/schedules', { params });
  },

  // 创建单人排班
  createSchedule: (data: CreateScheduleDto): Promise<ApiResponse<Schedule>> => {
    return api.post<unknown, ApiResponse<Schedule>>('/attendance/schedules', data);
  },

  // 批量创建排班
  batchCreateSchedule: (data: BatchCreateScheduleDto): Promise<ApiResponse<{ count: number }>> => {
    return api.post<unknown, ApiResponse<{ count: number }>>('/attendance/schedules/batch', data);
  },

  // 获取班次列表
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getShifts: (): Promise<ApiResponse<any[]>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return api.get<unknown, ApiResponse<any[]>>('/attendance/shifts');
  },

  // 删除排班
  deleteSchedule: (id: number): Promise<ApiResponse<void>> => {
    return api.delete<unknown, ApiResponse<void>>(`/attendance/schedules/${id}`);
  }
};
