import { api } from './api';
import { 
  TimePeriod, 
  CreateTimePeriodDto, 
  UpdateTimePeriodDto 
} from '@attendance/shared';

/**
 * 获取所有时间段
 */
export const getTimePeriods = async (): Promise<TimePeriod[]> => {
  return api.get('/attendance/time-periods');
};

/**
 * 获取单个时间段详情
 */
export const getTimePeriod = async (id: number): Promise<TimePeriod> => {
  return api.get(`/attendance/time-periods/${id}`);
};

/**
 * 创建时间段
 */
export const createTimePeriod = async (data: CreateTimePeriodDto): Promise<TimePeriod> => {
  return api.post('/attendance/time-periods', data);
};

/**
 * 更新时间段
 */
export const updateTimePeriod = async (id: number, data: UpdateTimePeriodDto): Promise<TimePeriod> => {
  return api.put(`/attendance/time-periods/${id}`, data);
};

/**
 * 删除时间段
 */
export const deleteTimePeriod = async (id: number): Promise<void> => {
  return api.delete(`/attendance/time-periods/${id}`);
};
