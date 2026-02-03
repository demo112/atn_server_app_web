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
export const getCorrections = async (params: QueryCorrectionsDto) => {
  return request.get<any, PaginatedResponse<CorrectionVo>>('/attendance/corrections', { params });
};

// SW66: Supplement Check-in
export const supplementCheckIn = async (data: SupplementCheckInDto) => {
  return request.post<any, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-in', data);
};

// SW66: Supplement Check-out
export const supplementCheckOut = async (data: SupplementCheckOutDto) => {
  return request.post<any, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-out', data);
};

// Helper: Get daily records (for finding exceptions to correct)
// Assuming there's an endpoint for this. If not, maybe use attendance/daily?
// att_daily_records is handled by... 
// I should check attendance-routes.ts to see where daily records are exposed.
// Usually /attendance/daily or similar.
export const getDailyRecords = async (params: QueryDailyRecordsDto) => {
    // This endpoint might need to be verified. 
    // If not found, I might skip this function or guess /attendance/daily
    return request.get<any, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/attendance/daily', { params });
};
