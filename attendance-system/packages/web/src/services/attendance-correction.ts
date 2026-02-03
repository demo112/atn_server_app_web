import { api } from './api';
import { 
  SupplementCheckInDto, 
  SupplementCheckOutDto, 
  QueryDailyRecordsDto, 
  SupplementResultVo, 
  PaginatedResponse,
  CorrectionDailyRecordVo as DailyRecordVo
} from '@attendance/shared';

export const attendanceCorrectionService = {
  // 补签到
  checkIn: (data: SupplementCheckInDto) => {
    return api.post<any, SupplementResultVo>('/attendance/corrections/check-in', data);
  },

  // 补签退
  checkOut: (data: SupplementCheckOutDto) => {
    return api.post<any, SupplementResultVo>('/attendance/corrections/check-out', data);
  },

  // 获取每日考勤记录 (用于列表展示)
  getDailyRecords: (params: QueryDailyRecordsDto) => {
    return api.get<any, PaginatedResponse<DailyRecordVo>>('/attendance/daily', { params });
  }
};
