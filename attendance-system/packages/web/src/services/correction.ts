import { api, validateResponse } from './api';
import { 
  CorrectionVo, 
  QueryCorrectionsDto, 
  SupplementCheckInDto,
  SupplementCheckOutDto,
  SupplementResultVo,
  CorrectionDailyRecordVo as DailyRecordVo,
  QueryDailyRecordsDto,
  PaginatedResponse,
  ApiResponse
} from '@attendance/shared';
import { 
  PaginatedCorrectionVoSchema, 
  SupplementResultVoSchema, 
  PaginatedDailyRecordVoSchema 
} from '../schemas/attendance';

// SW68: Get correction history
export const getCorrections = async (params: QueryCorrectionsDto): Promise<PaginatedResponse<CorrectionVo>> => {
  const res = await api.get<unknown, ApiResponse<PaginatedResponse<CorrectionVo>>>('/attendance/corrections', { params });
  return validateResponse(PaginatedCorrectionVoSchema, res);
};

// SW66: Supplement Check-in
export const supplementCheckIn = async (data: SupplementCheckInDto): Promise<SupplementResultVo> => {
  const res = await api.post<unknown, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-in', data);
  return validateResponse(SupplementResultVoSchema, res);
};

// SW66: Supplement Check-out
export const supplementCheckOut = async (data: SupplementCheckOutDto): Promise<SupplementResultVo> => {
  const res = await api.post<unknown, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-out', data);
  return validateResponse(SupplementResultVoSchema, res);
};

// Helper: Get daily records (for finding exceptions to correct)
export const getDailyRecords = async (params: QueryDailyRecordsDto): Promise<PaginatedResponse<DailyRecordVo>> => {
  const res = await api.get<unknown, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/attendance/daily', { params });
  return validateResponse(PaginatedDailyRecordVoSchema, res);
};
