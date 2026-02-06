import { api, validateResponse } from './api';
import { ClockRecord, ClockRecordQuery, CreateClockDto, ApiResponse } from '@attendance/shared';
import { PaginatedClockRecordSchema, ClockRecordSchema } from '../schemas/attendance';

export const getClockRecords = async (params: ClockRecordQuery): Promise<{ items: ClockRecord[]; total: number }> => {
  const res = await api.get<unknown, ApiResponse<{ items: ClockRecord[]; total: number }>>('/attendance/clock', { params });
  return validateResponse(PaginatedClockRecordSchema, res) as unknown as { items: ClockRecord[]; total: number };
};

export const manualClock = async (data: CreateClockDto): Promise<ClockRecord> => {
  const res = await api.post<unknown, ApiResponse<ClockRecord>>('/attendance/clock', data);
  return validateResponse(ClockRecordSchema, res) as unknown as ClockRecord;
};
