// ============================================
// 统计报表类型
// ============================================

export interface AttendanceSummaryVo {
  employeeId: number;
  employeeNo: string;
  employeeName: string;
  deptId: number;
  deptName: string;
  totalDays: number;         // 应出勤天数
  actualDays: number;        // 实际出勤天数
  lateCount: number;         // 迟到次数
  lateMinutes: number;       // 迟到总分钟
  earlyLeaveCount: number;   // 早退次数
  earlyLeaveMinutes: number; // 早退总分钟
  absentCount: number;       // 缺勤次数
  absentMinutes: number;     // 缺勤总分钟
  missingCount: number;      // 缺卡次数
  leaveCount: number;        // 请假次数
  leaveMinutes: number;      // 请假总分钟
  actualMinutes: number;     // 实际出勤总分钟
  effectiveMinutes: number;  // 有效出勤总分钟
  daily?: string[];          // 每日考勤状态 (用于前端月度报表)
}

export interface GetSummaryDto {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  deptId?: number;
  deptName?: string;
  employeeId?: number;
  employeeName?: string;
}

export interface DeptStatsVo {
  deptId: number;
  deptName: string;
  totalHeadcount: number; // 总人数
  normalCount: number;    // 正常出勤人次
  lateCount: number;      // 迟到人次
  earlyLeaveCount: number;// 早退人次
  absentCount: number;    // 缺勤人次
  leaveCount: number;     // 请假人次
  attendanceRate: number; // 出勤率 (0-100)
}

export interface GetDeptStatsDto {
  month: string; // YYYY-MM
  deptId?: number;
}

export interface ChartStatsVo {
  dailyTrend: {
    date: string;
    attendanceRate: number;
  }[];
  statusDistribution: {
    status: string; // normal/late/early/absent/leave
    count: number;
  }[];
}

export interface GetChartStatsDto {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  deptId?: number;
}

export interface ExportStatsDto {
  type?: 'summary' | 'daily';
  month?: string; // YYYY-MM (Required for summary)
  startDate?: string; // YYYY-MM-DD (Required for daily)
  endDate?: string;   // YYYY-MM-DD (Required for daily)
  deptId?: number;
  deptName?: string;
  employeeName?: string;
}

export interface GetDailyStatsQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface DailyStatsVo {
  date: string;          // YYYY-MM-DD
  expectedCount: number; // 应到人数（活跃员工数）
  actualCount: number;   // 实到人数（有打卡记录）
  attendanceRate: number;// 出勤率 (0-100)
  abnormalCount: number; // 异常人数（迟到/早退/缺卡）
  totalEmployees: number;// 总人数
}

export interface TriggerCalculationDto {
  startDate: string;
  endDate: string;
  employeeIds?: number[];
  deptId?: number;
  deptName?: string;
  employeeName?: string;
}
