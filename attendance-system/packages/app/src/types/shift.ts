export interface TimeSlot {
  id: string;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  mustCheckIn: boolean;
  checkInWindow: string; // "08:30-09:30"
  mustCheckOut: boolean;
  checkOutWindow: string; // "17:30-18:30"
}

export interface Shift {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
}

// Keeping these for potential future use or backward compatibility if needed elsewhere,
// but Shift interface is the main one used.
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
