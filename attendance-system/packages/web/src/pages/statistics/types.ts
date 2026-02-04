export type PageType = 'dashboard' | 'daily_stats' | 'monthly_summary' | 'monthly_card';

export type AttendanceStatus = '正常' | '迟到' | '早退' | '缺卡' | '未签到' | '不需打卡' | '休息' | '旷工' | '异常';

export interface Shift {
  time: string;
  status: AttendanceStatus;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  department: string;
  employeeId: string;
  date: string;
  attendanceGroup: string;
  shift: string;
  shifts: Shift[];
  workingHours: number;
  actualHours: number;
  lateMinutes: number;
  earlyMinutes: number;
  missingMinutes: number;
}

export interface MonthlySummaryData {
  name: string;
  department: string;
  employeeId: string;
  // 概况
  daysToClock: number;
  normalDays: number;
  reqHours: number;
  actHours: number;
  // 异常情况
  lateCount: number;
  lateMins: number;
  earlyCount: number;
  earlyMins: number;
  absentDays: number;
  missingCard: number;
  // 每日统计 (Partial mock)
  daily: string[];
}

export interface MonthlyCardUser {
  name: string;
  department: string;
  employeeId: string;
  attendanceGroup: string;
}
