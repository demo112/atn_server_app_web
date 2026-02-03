import { api, validateResponse } from './api';
import { 
  DailyRecordQuery, 
  DailyRecordVo, 
  PaginatedResponse, 
  GetSummaryDto, 
  AttendanceSummaryVo,
  GetDeptStatsDto,
  DeptStatsVo,
  GetChartStatsDto,
  ChartStatsVo,
  ExportStatsDto
} from '@attendance/shared';
import {
  AttendanceSummaryVoSchema,
  DeptStatsVoSchema,
  ChartStatsVoSchema
} from '../schemas/statistics';
import { PaginatedDailyRecordVoSchema } from '../schemas/attendance';
import { z } from 'zod';

export const getDepartmentSummary = async (params: GetSummaryDto): Promise<AttendanceSummaryVo[]> => {
  const res = await api.get('/statistics/summary', { params });
  return validateResponse(z.array(AttendanceSummaryVoSchema), res);
};

export const getDailyRecords = async (params: DailyRecordQuery): Promise<PaginatedResponse<DailyRecordVo>> => {
  const res = await api.get('/statistics/details', { params });
  return validateResponse(PaginatedDailyRecordVoSchema, res);
};

export const triggerCalculation = async (data: { startDate: string; endDate: string; employeeIds?: number[] }): Promise<void> => {
  const res = await api.post('/statistics/calculate', data);
  return validateResponse(z.void(), res);
};

export const getDeptStats = async (params: GetDeptStatsDto): Promise<DeptStatsVo[]> => {
  const res = await api.get('/statistics/departments', { params });
  return validateResponse(z.array(DeptStatsVoSchema), res);
};

export const getChartStats = async (params: GetChartStatsDto): Promise<ChartStatsVo> => {
  const res = await api.get('/statistics/charts', { params });
  return validateResponse(ChartStatsVoSchema, res);
};

export const exportStats = (params: ExportStatsDto): Promise<Blob> => {
  return api.get('/statistics/export', { 
    params,
    responseType: 'blob'
  });
};
