
export interface AttendanceRecord {
  id: string;
  workday: string;
  department: string;
  employeeId: string;
  name: string;
  shiftName: string;
  shiftTime: string;
  clockIn: string | null;
  clockOut: string | null;
  status: '缺勤' | '正常' | '迟到' | '早退';
  absenceDuration: number;
}

export type ModalType = 'in' | 'out' | null;
