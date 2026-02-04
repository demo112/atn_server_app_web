
export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export enum Tab {
  ShiftConfig = 'shift_config',
  AttendanceGroup = 'attendance_group'
}
