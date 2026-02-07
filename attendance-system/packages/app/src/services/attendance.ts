import request, { validateResponse } from '../utils/request';
import { 
  ClockRecord, 
  CreateClockDto, 
  ApiResponse, 
  LeaveVo, 
  CreateLeaveDto, 
  LeaveQueryDto,
  CorrectionVo,
  DailyRecordVo,
  CorrectionType,
  ScheduleVo,
  Shift,
  QueryDailyRecordsDto,
  PaginatedResponse
} from '@attendance/shared';
import { 
  ClockRecordSchema, 
  LeaveVoSchema, 
  CorrectionVoSchema, 
  PaginatedDailyRecordVoSchema, 
  ScheduleVoSchema,
  PaginatedClockRecordSchema,
  PaginatedCorrectionVoSchema,
  PaginatedLeaveVoSchema
} from '../schemas/attendance';
import { z } from 'zod';

export { ClockRecord, CreateClockDto, LeaveVo, CreateLeaveDto, CorrectionVo, DailyRecordVo, CorrectionType, ScheduleVo, Shift, QueryDailyRecordsDto, PaginatedResponse };

/**
 * 打卡
 */
export const clockIn = (data: CreateClockDto): Promise<ClockRecord> => {
  return validateResponse(
    request.post<any, ApiResponse<ClockRecord>>('/attendance/clock', data),
    ClockRecordSchema
  );
};

/**
 * 获取打卡记录
 */
export const getClockRecords = (params: { startTime: string; endTime: string }): Promise<ClockRecord[]> => {
  return validateResponse(
    request.get<any, ApiResponse<PaginatedResponse<ClockRecord>>>('/attendance/clock', { params }),
    PaginatedClockRecordSchema
  ).then(res => res.items);
};

/**
 * 获取请假列表
 */
export const getLeaves = (params: LeaveQueryDto): Promise<LeaveVo[]> => {
  return validateResponse(
    request.get<any, ApiResponse<PaginatedResponse<LeaveVo>>>('/attendance/leaves', { params }),
    PaginatedLeaveVoSchema
  ).then(res => res.items);
};

/**
 * 申请请假
 */
export const createLeave = (data: CreateLeaveDto): Promise<LeaveVo> => {
  return validateResponse(
    request.post<any, ApiResponse<LeaveVo>>('/attendance/leaves', data),
    LeaveVoSchema
  );
};

/**
 * 撤销请假
 */
export const cancelLeave = async (id: number): Promise<void> => {
  await validateResponse(
    request.delete<any, ApiResponse<{ id: number }>>(`/attendance/leaves/${id}`),
    z.object({ id: z.number() })
  );
};

/**
 * 获取补卡记录
 */
export const getCorrections = async (params: any): Promise<CorrectionVo[]> => {
  const resp = await request.get<any, ApiResponse<PaginatedResponse<CorrectionVo> | CorrectionVo[]>>('/attendance/corrections', { params });
  if (!resp.success) {
    throw new Error(resp.error?.message || 'Request failed');
  }
  const data = resp.data as any;
  return Array.isArray(data) ? data : (data?.items ?? []);
};

/**
 * 申请补卡 (签到)
 */
export const supplementCheckIn = (data: { dailyRecordId: string; checkInTime: string; remark: string }): Promise<any> => {
  return validateResponse(
    request.post<any, ApiResponse<any>>('/attendance/corrections/check-in', data),
    z.any()
  );
};

/**
 * 申请补卡 (签退)
 */
export const supplementCheckOut = (data: { dailyRecordId: string; checkOutTime: string; remark: string }): Promise<any> => {
  return validateResponse(
    request.post<any, ApiResponse<any>>('/attendance/corrections/check-out', data),
    z.any()
  );
};

/**
 * 获取每日考勤记录 (分页)
 */
export const getDailyRecords = (params: QueryDailyRecordsDto): Promise<PaginatedResponse<DailyRecordVo>> => {
  return validateResponse(
    request.get<any, ApiResponse<PaginatedResponse<DailyRecordVo>>>('/attendance/daily', { params }),
    PaginatedDailyRecordVoSchema
  );
};

/**
 * 获取排班记录
 */
export const getSchedules = (params: { employeeId?: number; deptId?: number; startDate: string; endDate: string }): Promise<ScheduleVo[]> => {
  return validateResponse(
    request.get<any, ApiResponse<ScheduleVo[]>>('/attendance/schedules', { params }),
    z.array(ScheduleVoSchema)
  );
};
