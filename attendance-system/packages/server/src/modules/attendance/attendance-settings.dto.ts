import { ApiResponse } from '@attendance/shared';

// 考勤设置数据结构
export interface AttendanceSettings {
  day_switch_time: string; // 考勤日切换时间 (HH:mm)
  auto_calc_time: string;  // 自动计算时间 (HH:mm)
  [key: string]: any;      // 允许扩展其他设置
}

// 获取设置响应
export type GetSettingsResponse = ApiResponse<AttendanceSettings>;

// 更新设置DTO
export interface UpdateSettingsDto {
  day_switch_time?: string;
  auto_calc_time?: string;
}
