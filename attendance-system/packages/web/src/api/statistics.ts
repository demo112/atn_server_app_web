import request from '../utils/request';
import { 
  DailyRecordQuery, 
  DailyRecordVo, 
  PaginatedResponse, 
  Response, 
  GetSummaryDto, 
  AttendanceSummaryVo,
  GetDeptStatsDto, 
  GetChartStatsDto, 
  ExportStatsDto, 
  DeptStatsVo, 
  ChartStatsVo 
} from '@attendance/shared';

export const getDepartmentSummary = (params: GetSummaryDto) => {
  return request.get<any, Response<AttendanceSummaryVo[]>>('/statistics/summary', { params });
};

export const getDailyRecords = (params: DailyRecordQuery) => {
  return request.get<any, Response<PaginatedResponse<DailyRecordVo>>>('/statistics/details', { params });
};

export const triggerCalculation = (data: { startDate: string; endDate: string; employeeIds?: number[] }) => {
  return request.post<any, Response<any>>('/statistics/calculate', data);
};

export const getDeptStats = (params: GetDeptStatsDto) => {
  return request.get<any, Response<DeptStatsVo[]>>('/statistics/departments', { params });
};

export const getChartStats = (params: GetChartStatsDto) => {
  return request.get<any, Response<ChartStatsVo>>('/statistics/charts', { params });
};

export const exportStats = (params: ExportStatsDto) => {
  return request.get('/statistics/export', { 
    params,
    responseType: 'blob' 
  });
};
