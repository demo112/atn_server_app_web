import { api } from './api';

export interface AttendanceSettings {
  day_switch_time: string; // 考勤日切换时间 (HH:mm)
  [key: string]: any;
}

export interface UpdateSettingsDto {
  day_switch_time?: string;
}

/**
 * 获取考勤设置
 */
export const getSettings = async (): Promise<AttendanceSettings> => {
  return api.get('/attendance/settings');
};

/**
 * 更新考勤设置
 */
export const updateSettings = async (data: UpdateSettingsDto): Promise<AttendanceSettings> => {
  return api.put('/attendance/settings', data);
};
