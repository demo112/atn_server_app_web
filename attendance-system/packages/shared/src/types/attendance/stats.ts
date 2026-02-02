// ============================================
// 统计报表类型
// ============================================

export interface AttendanceSummary {
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

export interface SummaryQuery {
  startDate: string;
  endDate: string;
  deptId?: number;
  employeeId?: number;
}
