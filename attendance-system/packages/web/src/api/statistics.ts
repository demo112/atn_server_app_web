import request from '../utils/request';
import { DailyRecordQuery, DailyRecordVo, PaginatedResponse, Response } from '@attendance/shared';

export const getDailyRecords = (params: DailyRecordQuery) => {
  return request.get<any, Response<PaginatedResponse<DailyRecordVo>>>('/statistics/details', { params });
};

export const triggerCalculation = (data: { startDate: string; endDate: string; employeeIds?: number[] }) => {
  return request.post<any, Response<any>>('/statistics/calculate', data);
};
