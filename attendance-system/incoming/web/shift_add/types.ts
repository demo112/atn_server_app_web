
export interface ShiftTimeConfig {
  clockIn: string;
  clockOut: string;
  isClockInMandatory: boolean;
  isClockOutMandatory: boolean;
  validFromStart: string;
  validFromEnd: string;
  validUntilStart: string;
  validUntilEnd: string;
}

export interface Shift {
  id: string;
  name: string;
  dailyCheckins: 1 | 2 | 3;
  times: ShiftTimeConfig[];
  lateGracePeriod: number;
  earlyLeaveGracePeriod: number;
  markAbsentIfNoCheckIn: 'Absent' | 'Late' | 'No Penalty';
  markAbsentIfNoCheckOut: 'Absent' | 'Early Leave' | 'No Penalty';
}
