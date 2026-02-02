import { QueryParams } from '../common';
import { AttendanceStatus, CorrectionType } from './record';

// 查询每日考勤记录参数
export interface QueryDailyRecordsDto extends QueryParams {
  deptId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  status?: AttendanceStatus; // 筛选特定状态
  employeeName?: string;
}

// 每日考勤记录视图对象 (用于异常处理列表)
export interface DailyRecordVo {
  id: string; // BigInt -> String
  employeeId: number;
  employeeName: string;
  deptName: string;
  workDate: string; // YYYY-MM-DD
  shiftName?: string;
  startTime?: string; // 班次开始时间 HH:mm
  endTime?: string;   // 班次结束时间 HH:mm
  checkInTime?: string; // ISO String
  checkOutTime?: string; // ISO String
  status: AttendanceStatus;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  absentMinutes?: number;
}

// 补签到请求参数
export interface SupplementCheckInDto {
  dailyRecordId: string; // BigInt -> String
  checkInTime: string;   // ISO String
  remark?: string;
}

// 补签退请求参数
export interface SupplementCheckOutDto {
  dailyRecordId: string; // BigInt -> String
  checkOutTime: string;  // ISO String
  remark?: string;
}

// 补签结果
export interface SupplementResultVo {
  success: boolean;
  dailyRecord: DailyRecordVo; // 返回更新后的记录
}

// ==========================================
// SW68 补签记录管理
// ==========================================

// 查询补签记录参数
export interface QueryCorrectionsDto extends QueryParams {
  deptId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

// 补签记录视图对象
export interface CorrectionVo {
  id: number;
  employeeId: number;
  employeeName: string;
  deptName: string;
  type: CorrectionType;
  correctionTime: string; // ISO String
  operatorName: string;
  updatedAt: string; // ISO String (操作时间)
  remark?: string;
}

// 补签记录列表响应
export interface CorrectionListVo {
  items: CorrectionVo[];
  total: number;
}

// 更新补签记录参数
export interface UpdateCorrectionDto {
  correctionTime: string; // ISO String
  remark?: string;
}
