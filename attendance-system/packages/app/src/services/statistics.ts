import request, { validateResponse } from '../utils/request';
import { DailyRecordQuery, DailyRecordVo, CalendarDailyVo, PaginatedResponse, ApiResponse as Response, GetDailyStatsQuery, DailyStatsVo } from '@attendance/shared';
import { CalendarDailyVoSchema, PaginatedDailyRecordVoSchema, DailyStatsVoSchema } from '../schemas/attendance';
import { z } from 'zod';

/**
 * 获取考勤日历数据
 */
export const getCalendar = (year: number, month: number, employeeId?: number): Promise<CalendarDailyVo[]> => {
  return validateResponse(
    request.get<unknown, Response<CalendarDailyVo[]>>('/statistics/calendar', { 
      params: { year, month, employeeId } 
    }),
    z.array(CalendarDailyVoSchema)
  );
};

/**
 * 获取考勤明细列表
 */
export const getDailyRecordDetails = (params: DailyRecordQuery): Promise<PaginatedResponse<DailyRecordVo>> => {
  return validateResponse(
    request.get<unknown, Response<PaginatedResponse<DailyRecordVo>>>('/statistics/details', { params }),
    PaginatedDailyRecordVoSchema
  );
};

/**
 * 获取每日考勤统计（管理员）
 */
export const getDailyStats = (params: GetDailyStatsQuery): Promise<DailyStatsVo[]> => {
  return validateResponse(
    request.get<unknown, Response<DailyStatsVo[]>>('/statistics/daily-summary', { params }),
    z.array(DailyStatsVoSchema)
  );
};
