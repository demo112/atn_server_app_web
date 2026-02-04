export enum ViewType {
  LIST = 'LIST',
  FORM = 'FORM'
}

export interface AttendanceGroup {
  id: string;
  name: string;
  memberCount: number;
  shiftName: string;
  expiryDate: string;
  status: 'valid' | 'expired';
}

export interface Shift {
  id: string;
  name: string;
  duration: string;
}

export interface Device {
  id: string;
  name: string;
  sn: string;
  status: 'online' | 'offline';
}

export interface Person {
  id: string;
  name: string;
  department: string;
  type: 'department' | 'employee';
}
