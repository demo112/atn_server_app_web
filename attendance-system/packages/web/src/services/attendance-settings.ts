import { api, validateResponse } from './api';
import { AttendanceSettingsSchema } from '../schemas/attendance';
import { ApiResponse } from '@attendance/shared';

export interface AttendanceSettings {
  day_switch_time: string; // 考勤日切换时间 (HH:mm)
  auto_calc_time?: string; // 自动计算时间 (HH:mm)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface UpdateSettingsDto {
  day_switch_time?: string;
  auto_calc_time?: string;
}

/**
 * 获取考勤设置
 */
export const getSettings = async (): Promise<AttendanceSettings> => {
  const res = await api.get<unknown, ApiResponse<AttendanceSettings>>('/attendance/settings');
  return validateResponse(AttendanceSettingsSchema, res);
};

/**
 * 更新考勤设置
 */
export const updateSettings = async (data: UpdateSettingsDto): Promise<AttendanceSettings> => {
  const res = await api.put<unknown, ApiResponse<AttendanceSettings>>('/attendance/settings', data);
  return validateResponse(AttendanceSettingsSchema, res);
};
