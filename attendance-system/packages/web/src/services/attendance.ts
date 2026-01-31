import { api } from './api';
import { Schedule, ApiResponse, PaginatedResponse } from '@attendance/shared';

export interface GetSchedulesParams {
  departmentId?: number;
  employeeId?: number;
  startDate: string;
  endDate: string;
}

export interface CreateScheduleDto {
  employeeId: number;
  shiftId: number;
  startDate: string;
  endDate: string;
  force?: boolean;
}

export interface BatchCreateScheduleDto {
  departmentIds: number[];
  shiftId: number;
  startDate: string;
  endDate: string;
  force?: boolean;
  includeSubDepartments?: boolean;
}

export const attendanceService = {
  // 获取排班列表
  getSchedules: (params: GetSchedulesParams) => {
    return api.get<any, ApiResponse<{ items: Schedule[] }>>('/attendance/schedules', { params });
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
