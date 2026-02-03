import { api, validateResponse } from './api';
import { AttendanceSettingsSchema } from '../schemas/attendance';
import { ApiResponse, AttendanceSettings, UpdateSettingsDto } from '@attendance/shared';

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
