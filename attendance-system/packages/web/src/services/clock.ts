import request from '../utils/request';
import { ClockRecord, ClockRecordQuery, CreateClockDto, ApiResponse } from '@attendance/shared';

export const getClockRecords = async (params: ClockRecordQuery): Promise<{ items: ClockRecord[]; total: number }> => {
  const res = await request.get<any, ApiResponse<{ items: ClockRecord[]; total: number }>>('/attendance/clock', { params });
  return res.data!;
};

export const manualClock = async (data: CreateClockDto): Promise<ClockRecord> => {
  const res = await request.post<any, ApiResponse<ClockRecord>>('/attendance/clock', data);
  return res.data!;
};
