
export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface SessionConfig {
  checkIn: string;
  checkInMandatory: boolean;
  checkInRangeStart: string;
  checkInRangeEnd: string;
  checkOut: string;
  checkOutMandatory: boolean;
  checkOutRangeStart: string;
  checkOutRangeEnd: string;
}

export interface AbsenceRules {
  allowLateArrival: number;
  allowEarlyDeparture: number;
  noCheckInTreatedAs: 'Absence' | 'Leave';
  noCheckOutTreatedAs: 'Absence' | 'Leave';
}
