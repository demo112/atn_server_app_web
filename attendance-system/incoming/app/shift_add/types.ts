
export interface TimeSegment {
  id: string;
  startTime: string;
  endTime: string;
  mustSignIn: boolean;
  signInRange: string;
  mustSignOut: boolean;
  signOutRange: string;
}

export interface ShiftSettings {
  name: string;
  segments: TimeSegment[];
  allowedLateMinutes: number;
  allowedEarlyLeaveMinutes: number;
}
