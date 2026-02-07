import { api, validateResponse } from './api';
import { z } from 'zod';
import { Shift, Schedule, ApiResponse, CreateScheduleDto, BatchCreateScheduleDto, ScheduleQueryDto, PaginatedResponse } from '@attendance/shared';
import { ScheduleSchema, ShiftSchema, ScheduleVoSchema } from '../schemas/attendance';

export const attendanceService = {
  // 获取排班列表
  getSchedules: async (params: ScheduleQueryDto): Promise<Schedule[]> => {
    const res = await api.get<unknown, ApiResponse<Schedule[]>>('/attendance/schedules', { params });
    return validateResponse(z.array(ScheduleVoSchema), res) as unknown as Schedule[];
  },

  // 创建单人排班
  createSchedule: async (data: CreateScheduleDto): Promise<Schedule> => {
    const res = await api.post<unknown, ApiResponse<Schedule>>('/attendance/schedules', data);
    return validateResponse(ScheduleSchema, res) as unknown as Schedule;
  },

  // 批量创建排班
  batchCreateSchedule: async (data: BatchCreateScheduleDto): Promise<{ count: number }> => {
    const res = await api.post<unknown, ApiResponse<{ count: number }>>('/attendance/schedules/batch', data);
    return validateResponse(z.object({ count: z.number() }), res);
  },

  // 获取班次列表
  getShifts: async (): Promise<Shift[]> => {
    // Request a large page size to get all shifts for dropdown
    const res = await api.get<unknown, ApiResponse<PaginatedResponse<Shift>>>('/attendance/shifts', {
      params: { page: 1, pageSize: 1000 }
    });
    
    // The backend returns a paginated response, so we need to extract items
    const PaginatedShiftSchema = z.object({
      items: z.array(ShiftSchema),
      total: z.number().optional()
    });
    
    const paginatedData = validateResponse(PaginatedShiftSchema, res);
    return paginatedData.items as unknown as Shift[];
  },

  // 删除排班
  deleteSchedule: async (id: number): Promise<void> => {
    const res = await api.delete<unknown, ApiResponse<{ id: number }>>(`/attendance/schedules/${id}`);
    validateResponse(z.object({ id: z.number() }), res);
  }
};
