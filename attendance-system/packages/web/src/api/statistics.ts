import request from '../utils/request';
import { DailyRecordQuery, DailyRecordVo, PaginatedResponse, Response, GetSummaryDto, AttendanceSummaryVo } from '@attendance/shared';

export const getDepartmentSummary = (params: GetSummaryDto) => {
  return request.get<any, Response<AttendanceSummaryVo[]>>('/statistics/summary', { params });
};

export const getDailyRecords = (params: DailyRecordQuery) => {
  return request.get<any, Response<PaginatedResponse<DailyRecordVo>>>('/statistics/details', { params });
};

export const triggerCalculation = (data: { startDate: string; endDate: string; employeeIds?: number[] }) => {
  return request.post<any, Response<any>>('/statistics/calculate', data);
};
