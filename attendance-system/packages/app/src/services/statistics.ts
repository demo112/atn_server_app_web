import request from '../utils/request';
import { DailyRecordQuery, DailyRecordVo, CalendarDailyVo, PaginatedResponse, ApiResponse as Response } from '@attendance/shared';

/**
 * 获取考勤日历数据
 */
export const getCalendar = (year: number, month: number, employeeId?: number): Promise<Response<CalendarDailyVo[]>> => {
  return request.get<unknown, Response<CalendarDailyVo[]>>('/statistics/calendar', { 
    params: { year, month, employeeId } 
  });
};

/**
 * 获取考勤明细列表
 */
export const getDailyRecordDetails = (params: DailyRecordQuery): Promise<Response<PaginatedResponse<DailyRecordVo>>> => {
  return request.get<unknown, Response<PaginatedResponse<DailyRecordVo>>>('/statistics/details', { params });
};
