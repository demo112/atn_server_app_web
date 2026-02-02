// 请假类型
export enum LeaveType {
  annual = 'annual',
  sick = 'sick',
  personal = 'personal',
  business_trip = 'business_trip',
  maternity = 'maternity',
  paternity = 'paternity',
  marriage = 'marriage',
  bereavement = 'bereavement',
  other = 'other'
}

// 请假状态
export enum LeaveStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  cancelled = 'cancelled'
}

// 请假记录 VO
export interface LeaveVo {
  id: number;
  employeeId: number;
  type: LeaveType;
  startTime: string; // ISO Date String
  endTime: string;
  reason?: string | null;
  status: LeaveStatus;
  approverId?: number | null;
  approvedAt?: string | null; // ISO Date String
  createdAt: string;
  updatedAt: string;

  // 关联信息
  employeeName?: string;
  deptName?: string;
  approverName?: string;
}

// 创建请假 DTO
export interface CreateLeaveDto {
  employeeId: number;
  type: LeaveType;
  startTime: string;
  endTime: string;
  reason?: string;
  operatorId?: number; // 后端注入
}

// 更新请假 DTO
export interface UpdateLeaveDto {
  type?: LeaveType;
  startTime?: string;
  endTime?: string;
  reason?: string;
  operatorId?: number;
}

// 查询 DTO
export interface LeaveQueryDto {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  deptId?: number;
  startTime?: string;
  endTime?: string;
  type?: LeaveType;
  status?: LeaveStatus;
}
