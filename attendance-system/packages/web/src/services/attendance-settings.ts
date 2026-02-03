import { api } from './api';

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
  return api.get('/attendance/settings');
};

/**
 * 更新考勤设置
 */
export const updateSettings = async (data: UpdateSettingsDto): Promise<AttendanceSettings> => {
  return api.put('/attendance/settings', data);
};
