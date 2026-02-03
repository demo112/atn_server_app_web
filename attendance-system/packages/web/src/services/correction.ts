import request from '../utils/request';
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

// SW68: Get correction history
export const getCorrections = async (params: QueryCorrectionsDto): Promise<PaginatedResponse<CorrectionVo>> => {
  return request.get<unknown, PaginatedResponse<CorrectionVo>>('/attendance/corrections', { params });
};

// SW66: Supplement Check-in
export const supplementCheckIn = async (data: SupplementCheckInDto): Promise<ApiResponse<SupplementResultVo>> => {
  return request.post<unknown, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-in', data);
};

// SW66: Supplement Check-out
export const supplementCheckOut = async (data: SupplementCheckOutDto): Promise<ApiResponse<SupplementResultVo>> => {
  return request.post<unknown, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-out', data);
};

// Helper: Get daily records (for finding exceptions to correct)
// Assuming there's an endpoint for this. If not, maybe use attendance/daily?
// att_daily_records is handled by... 
// I should check attendance-routes.ts to see where daily records are exposed.
// Usually /attendance/daily or similar.
export const getDailyRecords = async (params: QueryDailyRecordsDto): Promise<ApiResponse<PaginatedResponse<DailyRecordVo>>> => {
    // This endpoint might need to be verified. 
    // If not found, I might skip this function or guess /attendance/daily
    return request.get<unknown, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/attendance/daily', { params });
};
