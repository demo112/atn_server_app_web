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

export const getDepartmentSummary = (params: GetSummaryDto) => {
  return request.get<any, ApiResponse<AttendanceSummaryVo[]>>('/statistics/summary', { params });
};

export const getDailyRecords = (params: DailyRecordQuery) => {
  return request.get<any, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/statistics/details', { params });
};

export const triggerCalculation = (data: { startDate: string; endDate: string; employeeIds?: number[] }) => {
  return request.post<any, ApiResponse<any>>('/statistics/calculate', data);
};

export const getDeptStats = (params: GetDeptStatsDto) => {
  return request.get<any, ApiResponse<DeptStatsVo[]>>('/statistics/dept-stats', { params });
};

export const getChartStats = (params: GetChartStatsDto) => {
  return request.get<any, ApiResponse<ChartStatsVo>>('/statistics/chart-stats', { params });
};

export const exportStats = (params: ExportStatsDto) => {
  return request.get<any, Blob>('/statistics/export', { 
    params,
    responseType: 'blob'
  });
};
