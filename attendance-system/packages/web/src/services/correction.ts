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
  ApiResponse,
  UpdateCorrectionDto
} from '@attendance/shared';
import { 
  PaginatedCorrectionVoSchema, 
  SupplementResultVoSchema, 
  PaginatedDailyRecordVoSchema,
  CorrectionVoSchema
} from '../schemas/attendance';
import { z } from 'zod';

// SW68: Get correction history
export const getCorrections = async (params: QueryCorrectionsDto): Promise<PaginatedResponse<CorrectionVo>> => {
  const res = await api.get<unknown, ApiResponse<PaginatedResponse<CorrectionVo>>>('/attendance/corrections', { params });
  return validateResponse(PaginatedCorrectionVoSchema, res) as unknown as PaginatedResponse<CorrectionVo>;
};

// SW68: Update correction record
export const updateCorrection = async (id: number, data: UpdateCorrectionDto): Promise<CorrectionVo> => {
  const res = await api.put<unknown, ApiResponse<CorrectionVo>>(`/attendance/corrections/${id}`, data);
  return validateResponse(CorrectionVoSchema, res) as unknown as CorrectionVo;
};

// SW66: Supplement Check-in
export const supplementCheckIn = async (data: SupplementCheckInDto): Promise<SupplementResultVo> => {
  const res = await api.post<unknown, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-in', data);
  return validateResponse(SupplementResultVoSchema, res) as unknown as SupplementResultVo;
};

// SW66: Supplement Check-out
export const supplementCheckOut = async (data: SupplementCheckOutDto): Promise<SupplementResultVo> => {
  const res = await api.post<unknown, ApiResponse<SupplementResultVo>>('/attendance/corrections/check-out', data);
  return validateResponse(SupplementResultVoSchema, res) as unknown as SupplementResultVo;
};

// Helper: Get daily records (for finding exceptions to correct)
export const getDailyRecords = async (params: QueryDailyRecordsDto): Promise<PaginatedResponse<DailyRecordVo>> => {
  const res = await api.get<unknown, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/attendance/daily', { params });
  return validateResponse(PaginatedDailyRecordVoSchema, res) as unknown as PaginatedResponse<DailyRecordVo>;
};

// Manually trigger recalculation
export const triggerRecalculation = async (data: { startDate: string; endDate: string; employeeIds?: number[] }): Promise<string> => {
  const res = await api.post('/attendance/recalculate', data);
  const validated = validateResponse(z.object({
    message: z.string(),
    batchId: z.string()
  }), res);
  return validated.batchId;
};

export interface CalculationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'completed_with_errors';
  progress: number;
  message?: string;
  error?: string;
}

export const getRecalculationStatus = async (batchId: string): Promise<CalculationStatus> => {
  const res = await api.get(`/attendance/recalculate/${batchId}/status`);
  return validateResponse(z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'completed_with_errors']),
    progress: z.number(),
    message: z.string().optional(),
    error: z.string().optional()
  }), res);
};
