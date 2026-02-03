import { api, validateResponse } from './api';
import { z } from 'zod';
import { Schedule, ApiResponse, CreateScheduleDto, BatchCreateScheduleDto, ScheduleQueryDto } from '@attendance/shared';
import { ScheduleSchema, ShiftSchema } from '../schemas/attendance';

export const attendanceService = {
  // 获取排班列表
  getSchedules: async (params: ScheduleQueryDto): Promise<Schedule[]> => {
    const res = await api.get<unknown, ApiResponse<Schedule[]>>('/attendance/schedules', { params });
    return validateResponse(z.array(ScheduleSchema), res);
  },

  // 创建单人排班
  createSchedule: async (data: CreateScheduleDto): Promise<Schedule> => {
    const res = await api.post<unknown, ApiResponse<Schedule>>('/attendance/schedules', data);
    return validateResponse(ScheduleSchema, res);
  },

  // 批量创建排班
  batchCreateSchedule: async (data: BatchCreateScheduleDto): Promise<{ count: number }> => {
    const res = await api.post<unknown, ApiResponse<{ count: number }>>('/attendance/schedules/batch', data);
    return validateResponse(z.object({ count: z.number() }), res);
  },

  // 获取班次列表
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getShifts: async (): Promise<any[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await api.get<unknown, ApiResponse<any[]>>('/attendance/shifts');
    // Using ShiftSchema to validate and return strictly typed array, removing 'any'
    return validateResponse(z.array(ShiftSchema), res);
  },

  // 删除排班
  deleteSchedule: async (id: number): Promise<void> => {
    const res = await api.delete<unknown, ApiResponse<void>>(`/attendance/schedules/${id}`);
    return validateResponse(z.void(), res);
  }
};
