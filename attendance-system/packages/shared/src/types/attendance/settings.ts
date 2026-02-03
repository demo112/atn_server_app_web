
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
