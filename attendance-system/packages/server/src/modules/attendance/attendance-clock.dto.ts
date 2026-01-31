import { ApiResponse, PaginatedResponse } from '@attendance/shared';
import { ClockType, ClockSource } from '@prisma/client';

// 对应 Prisma 模型 (Response)
export interface AttClockRecordVo {
  id: string; // BigInt 序列化为 string
  employeeId: number;
  clockTime: Date;
  type: ClockType;
  source: ClockSource;
  deviceInfo: any | null;
  location: any | null;
  operatorId: number | null;
  remark: string | null;
  createdAt: Date;
  
  // 关联信息 (可选)
  employeeName?: string;
  deptName?: string;
  operatorName?: string;
}

// 创建打卡记录 DTO
export interface CreateClockDto {
  employeeId: number;
  clockTime?: string; // ISO Date String
  type: ClockType;
  source: ClockSource;
  deviceInfo?: any;
  location?: any;
  operatorId?: number; // Web打卡必填
  remark?: string;
}

// 查询参数 DTO
export interface ClockQueryDto {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  deptId?: number;
  startTime?: string; // YYYY-MM-DD HH:mm:ss
  endTime?: string;
  type?: ClockType;
  source?: ClockSource;
}

// 列表响应
export type ClockListResponse = PaginatedResponse<AttClockRecordVo>;

// 单条响应
export type ClockResponse = ApiResponse<AttClockRecordVo>;
