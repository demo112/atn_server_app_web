
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  mustCheckIn: boolean;
  checkInWindow: string;
  mustCheckOut: boolean;
  checkOutWindow: string;
}

export interface Shift {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
}

export type AppView = 'list' | 'edit';
