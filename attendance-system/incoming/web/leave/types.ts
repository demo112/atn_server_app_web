
export enum LeaveType {
  LEAVE = '请假',
  TRIP = '出差'
}

export enum LeaveSubType {
  PERSONAL = '事假',
  SICK = '病假',
  ANNUAL = '年假',
  OTHER = '其他'
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  startTime: string;
  endTime: string;
  type: LeaveType;
  subType: LeaveSubType;
  applyTime: string;
  note: string;
  duration: number; // in minutes
  status: 'pending' | 'approved' | 'rejected';
}

export interface OrgNode {
  id: string;
  name: string;
  type: 'dept' | 'user' | 'group';
  children?: OrgNode[];
  memberCount?: number;
}
