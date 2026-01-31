import { ApiResponse } from '@attendance/shared';

// 班次数据模型 (Response)
export interface AttShiftVo {
  id: number;
  name: string;
  cycleDays: number;
  days: ShiftDayVo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftDayVo {
  dayOfCycle: number; // 1-7
  periods: any[]; // AttTimePeriod[]
}

// 班次内的单日配置
export interface ShiftDayDto {
  dayOfCycle: number;
  periodIds: number[];
}

// 创建班次 DTO
export interface CreateShiftDto {
  name: string;
  cycleDays?: number;
  days: ShiftDayDto[];
}

// 更新班次 DTO
export interface UpdateShiftDto {
  name?: string;
  days?: ShiftDayDto[];
}

// 列表响应
export type ShiftListResponse = ApiResponse<Omit<AttShiftVo, 'days'>[]>; // 列表可能不需要详细days? 设计文档说是 "data: [ { id: 1, name: "...", cycleDays: 7 } ]"

// 详情响应
export type ShiftResponse = ApiResponse<AttShiftVo>;
