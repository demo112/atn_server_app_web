import { api } from './api';
import { 
  SupplementCheckInDto, 
  SupplementCheckOutDto, 
  QueryDailyRecordsDto, 
  SupplementResultVo, 
  PaginatedResponse,
  ApiResponse,
  CorrectionDailyRecordVo as DailyRecordVo
} from '@attendance/shared';

export const attendanceCorrectionService = {
  // 补签到
  checkIn: (data: SupplementCheckInDto): Promise<SupplementResultVo> => {
    return api.post<unknown, SupplementResultVo>('/attendance/corrections/check-in', data);
  },

  // 补签退
  checkOut: (data: SupplementCheckOutDto): Promise<SupplementResultVo> => {
    return api.post<unknown, SupplementResultVo>('/attendance/corrections/check-out', data);
  },

  // 获取每日考勤记录 (用于列表展示)
  getDailyRecords: async (params: QueryDailyRecordsDto): Promise<PaginatedResponse<DailyRecordVo>> => {
    const res = await api.get<unknown, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/attendance/daily', { params });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch daily records');
    }
    return res.data;
  }
};
