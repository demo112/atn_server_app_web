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
  const res = await api.get('/attendance/time-periods');
  return res.data;
};

/**
 * 获取单个时间段详情
 */
export const getTimePeriod = async (id: number): Promise<TimePeriod> => {
  const res = await api.get(`/attendance/time-periods/${id}`);
  return res.data;
};

/**
 * 创建时间段
 */
export const createTimePeriod = async (data: CreateTimePeriodDto): Promise<TimePeriod> => {
  const res = await api.post('/attendance/time-periods', data);
  return res.data;
};

/**
 * 更新时间段
 */
export const updateTimePeriod = async (id: number, data: UpdateTimePeriodDto): Promise<TimePeriod> => {
  const res = await api.put(`/attendance/time-periods/${id}`, data);
  return res.data;
};

/**
 * 删除时间段
 */
export const deleteTimePeriod = async (id: number): Promise<void> => {
  return api.delete(`/attendance/time-periods/${id}`);
};
