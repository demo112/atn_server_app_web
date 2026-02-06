import { api, validateResponse } from './api';
import { 
  TimePeriod, 
  CreateTimePeriodDto, 
  UpdateTimePeriodDto,
  ApiResponse 
} from '@attendance/shared';
import { TimePeriodSchema } from '../schemas/attendance';
import { z } from 'zod';

/**
 * 获取所有时间段
 */
export const getTimePeriods = async (): Promise<TimePeriod[]> => {
  const res = await api.get<unknown, ApiResponse<TimePeriod[]>>('/attendance/time-periods');
  return validateResponse(z.array(TimePeriodSchema), res) as unknown as TimePeriod[];
};

/**
 * 获取单个时间段详情
 */
export const getTimePeriod = async (id: number): Promise<TimePeriod> => {
  const res = await api.get<unknown, ApiResponse<TimePeriod>>(`/attendance/time-periods/${id}`);
  return validateResponse(TimePeriodSchema, res) as unknown as TimePeriod;
};

/**
 * 创建时间段
 */
export const createTimePeriod = async (data: CreateTimePeriodDto): Promise<TimePeriod> => {
  const res = await api.post<unknown, ApiResponse<TimePeriod>>('/attendance/time-periods', data);
  return validateResponse(TimePeriodSchema, res) as unknown as TimePeriod;
};

/**
 * 更新时间段
 */
export const updateTimePeriod = async (id: number, data: UpdateTimePeriodDto): Promise<TimePeriod> => {
  const res = await api.put<unknown, ApiResponse<TimePeriod>>(`/attendance/time-periods/${id}`, data);
  return validateResponse(TimePeriodSchema, res) as unknown as TimePeriod;
};

/**
 * 删除时间段
 */
export const deleteTimePeriod = async (id: number): Promise<void> => {
  const res = await api.delete<unknown, ApiResponse<void>>(`/attendance/time-periods/${id}`);
  return validateResponse(z.void(), res);
};
