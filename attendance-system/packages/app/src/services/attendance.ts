import request from '../utils/request';
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
  ScheduleVo
} from '@attendance/shared';

export { ClockRecord, CreateClockDto, LeaveVo, CreateLeaveDto, CorrectionVo, DailyRecordVo, CorrectionType, ScheduleVo };

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
  return request.delete<any, ApiResponse<void>>(`/attendance/leaves/${id}`);
};

/**
 * 获取补卡记录
 */
export const getCorrections = (params: any) => {
  return request.get<any, ApiResponse<CorrectionVo[]>>('/attendance/corrections', { params });
};

/**
 * 申请补卡 (签到)
 */
export const supplementCheckIn = (data: { dailyRecordId: string; checkInTime: string; remark: string }) => {
  return request.post<any, ApiResponse<any>>('/attendance/corrections/check-in', data);
};

/**
 * 申请补卡 (签退)
 */
export const supplementCheckOut = (data: { dailyRecordId: string; checkOutTime: string; remark: string }) => {
  return request.post<any, ApiResponse<any>>('/attendance/corrections/check-out', data);
};

/**
 * 获取每日考勤记录 (用于补卡选择)
 */
export const getDailyRecords = (params: { startDate: string; endDate: string }) => {
  return request.get<any, ApiResponse<DailyRecordVo[]>>('/attendance/daily', { params });
};

/**
 * 获取排班记录
 */
export const getSchedules = (params: { employeeId?: number; deptId?: number; startDate: string; endDate: string }) => {
  return request.get<any, ApiResponse<ScheduleVo[]>>('/attendance/schedules', { params });
};
