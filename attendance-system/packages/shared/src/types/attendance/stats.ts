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
  leaveCount: number;        // 请假次数
  leaveMinutes: number;      // 请假总分钟
  actualMinutes: number;     // 实际出勤总分钟
  effectiveMinutes: number;  // 有效出勤总分钟
}

export interface GetSummaryDto {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  deptId?: number;
  employeeId?: number;
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
  month: string; // YYYY-MM
  deptId?: number;
}
