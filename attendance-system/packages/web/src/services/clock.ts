import request from '../utils/request';
import { ClockRecord, ClockRecordQuery, CreateClockDto, ApiResponse } from '@attendance/shared';

export const getClockRecords = async (params: ClockRecordQuery): Promise<{ items: ClockRecord[]; total: number }> => {
  const res = await request.get<unknown, ApiResponse<{ items: ClockRecord[]; total: number }>>('/attendance/clock', { params });
  return res.data || { items: [], total: 0 };
};

export const manualClock = async (data: CreateClockDto): Promise<ClockRecord> => {
  const res = await request.post<unknown, ApiResponse<ClockRecord>>('/attendance/clock', data);
  if (!res.data) throw new Error('Failed to create clock record');
  return res.data;
};
