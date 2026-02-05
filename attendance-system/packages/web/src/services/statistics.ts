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
  ExportStatsDto,
  CalendarDailyVo
} from '@attendance/shared';
import {
  AttendanceSummaryVoSchema,
  DeptStatsVoSchema,
  ChartStatsVoSchema
} from '../schemas/statistics';
import { PaginatedDailyRecordVoSchema } from '../schemas/attendance';
import { z } from 'zod';

export const getDepartmentSummary = async (params: GetSummaryDto): Promise<AttendanceSummaryVo[]> => {
  const res = await api.get('/statistics/monthly', { params });
  return validateResponse(z.array(AttendanceSummaryVoSchema), res);
};

export const getDailyRecords = async (params: DailyRecordQuery): Promise<PaginatedResponse<DailyRecordVo>> => {
  const res = await api.get('/statistics/daily', { params });
  return validateResponse(PaginatedDailyRecordVoSchema, res);
};

export const getCalendar = async (year: number, month: number, employeeId?: number): Promise<CalendarDailyVo[]> => {
  const res = await api.get('/statistics/card', { params: { year, month, employeeId } });
  return validateResponse(z.array(z.object({
    date: z.string(),
    status: z.any(), // z.custom<AttendanceStatus>() is tricky without enum definition here, using any or string
    isAbnormal: z.boolean()
  })), res);
};

export const triggerCalculation = async (data: { startDate: string; endDate: string; employeeIds?: number[] }): Promise<void> => {
  const res = await api.post('/statistics/calculate', data);
  // Backend returns { message: '...' } but we don't need it, so use z.any() to pass validation
  return validateResponse(z.any(), res);
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
