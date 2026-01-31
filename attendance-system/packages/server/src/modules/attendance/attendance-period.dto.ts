import { ApiResponse } from '@attendance/shared';

// 对应 Prisma 模型
export interface AttTimePeriod {
  id: number;
  name: string;
  type: number; // 0:固定, 1:弹性
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  restStartTime: string | null;
  restEndTime: string | null;
  rules: any | null;
  createdAt: Date;
  updatedAt: Date;
}

// 创建时间段 DTO
export interface CreateTimePeriodDto {
  name: string;
  type: number;
  startTime: string; // Regex: ^([01]\d|2[0-3]):([0-5]\d)$
  endTime: string;
  restStartTime?: string;
  restEndTime?: string;
  rules?: any;
}

// 更新时间段 DTO
export interface UpdateTimePeriodDto {
  name?: string;
  type?: number;
  startTime?: string;
  endTime?: string;
  restStartTime?: string;
  restEndTime?: string;
  rules?: any;
}

// 列表响应
export type TimePeriodListResponse = ApiResponse<AttTimePeriod[]>;

// 单个详情响应
export type TimePeriodResponse = ApiResponse<AttTimePeriod>;
