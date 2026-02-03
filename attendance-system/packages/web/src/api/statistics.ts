import request from '../utils/request';
import { 
  DailyRecordQuery, 
  DailyRecordVo, 
  PaginatedResponse, 
  ApiResponse, 
  GetSummaryDto, 
  AttendanceSummaryVo,
  GetDeptStatsDto,
  DeptStatsVo,
  GetChartStatsDto,
  ChartStatsVo,
  ExportStatsDto
} from '@attendance/shared';

export const getDepartmentSummary = (params: GetSummaryDto): Promise<ApiResponse<AttendanceSummaryVo[]>> => {
  return request.get<unknown, ApiResponse<AttendanceSummaryVo[]>>('/statistics/summary', { params });
};

export const getDailyRecords = (params: DailyRecordQuery): Promise<ApiResponse<PaginatedResponse<DailyRecordVo>>> => {
  return request.get<unknown, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/statistics/details', { params });
};

export const triggerCalculation = (data: { startDate: string; endDate: string; employeeIds?: number[] }): Promise<ApiResponse<unknown>> => {
  return request.post<unknown, ApiResponse<unknown>>('/statistics/calculate', data);
};

export const getDeptStats = (params: GetDeptStatsDto): Promise<ApiResponse<DeptStatsVo[]>> => {
  return request.get<unknown, ApiResponse<DeptStatsVo[]>>('/statistics/departments', { params });
};

export const getChartStats = (params: GetChartStatsDto): Promise<ApiResponse<ChartStatsVo>> => {
  return request.get<unknown, ApiResponse<ChartStatsVo>>('/statistics/charts', { params });
};

export const exportStats = (params: ExportStatsDto): Promise<Blob> => {
  return request.get<unknown, Blob>('/statistics/export', { 
    params,
    responseType: 'blob'
  });
};
