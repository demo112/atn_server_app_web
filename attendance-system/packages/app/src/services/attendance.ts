import request from '../utils/request';
import { 
  ClockRecord, 
  CreateClockDto, 
  ApiResponse, 
  LeaveVo, 
  CreateLeaveDto, 
  LeaveQueryDto,
  Correction,
  DailyRecord,
  CorrectionType
} from '@attendance/shared';

export { ClockRecord, CreateClockDto, LeaveVo, CreateLeaveDto, Correction, DailyRecord, CorrectionType };

/**
 * 打卡
 */
export const clockIn = (data: CreateClockDto) => {
  return request.post<any, ApiResponse<ClockRecord>>('/attendance/clock', data);
};

/**
 * 获取打卡记录
 */
export const getClockRecords = (params: { startTime: string; endTime: string }) => {
  return request.get<any, ApiResponse<ClockRecord[]>>('/attendance/clock', { params });
};

/**
 * 获取请假列表
 */
export const getLeaves = (params: LeaveQueryDto) => {
  return request.get<any, ApiResponse<LeaveVo[]>>('/attendance/leaves', { params });
};

/**
 * 申请请假
 */
export const createLeave = (data: CreateLeaveDto) => {
  return request.post<any, ApiResponse<LeaveVo>>('/attendance/leaves', data);
};

/**
 * 撤销请假
 */
export const cancelLeave = (id: number) => {
  return request.post<any, ApiResponse<void>>(`/attendance/leaves/${id}/cancel`);
};

/**
 * 获取补卡记录
 */
export const getCorrections = (params: any) => {
  return request.get<any, ApiResponse<Correction[]>>('/attendance/corrections', { params });
};

/**
 * 申请补卡
 */
export const createCorrection = (data: { dailyRecordId: number; type: CorrectionType; clockTime: string; remark: string }) => {
  return request.post<any, ApiResponse<Correction>>('/attendance/corrections', data);
};

/**
 * 获取每日考勤记录 (用于补卡选择)
 */
export const getDailyRecords = (params: { startDate: string; endDate: string }) => {
  return request.get<any, ApiResponse<DailyRecord[]>>('/attendance/daily-records', { params });
};
