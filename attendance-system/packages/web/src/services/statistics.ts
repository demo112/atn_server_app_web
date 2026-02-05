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
import { PaginatedDailyRecordVoSchema, AttendanceStatusSchema } from '../schemas/attendance';
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
    status: AttendanceStatusSchema,
    isAbnormal: z.boolean()
  })), res);
};

export interface CalculationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'completed_with_errors';
  progress: number;
  message?: string;
  error?: string;
}

export const getRecalculationStatus = async (batchId: string): Promise<CalculationStatus> => {
  const res = await api.get(`/statistics/calculate/${batchId}/status`);
  return validateResponse(z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'completed_with_errors']),
    progress: z.number(),
    message: z.string().optional(),
    error: z.string().optional()
  }), res);
};

export const triggerCalculation = async (data: { startDate: string; endDate: string; employeeIds?: number[] }): Promise<string> => {
  const res = await api.post('/statistics/calculate', data);
  const validated = validateResponse(z.object({
    message: z.string(),
    batchId: z.string()
  }), res);
  return validated.batchId;
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
