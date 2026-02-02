import { ApiResponse, PaginatedResponse } from '@attendance/shared';
import { LeaveType, LeaveStatus } from '@prisma/client';

// 对应 Prisma 模型 (Response)
export interface AttLeaveVo {
  id: number;
  employeeId: number;
  type: LeaveType;
  startTime: Date;
  endTime: Date;
  reason: string | null;
  status: LeaveStatus;
  approverId: number | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // 关联信息
  employeeName?: string;
  deptName?: string;
  approverName?: string;
}

// 创建请假记录 DTO
export interface CreateLeaveDto {
  employeeId: number;
  type: LeaveType;
  startTime: string; // ISO Date String
  endTime: string;   // ISO Date String
  reason?: string;
  // 管理员录入，operatorId 即为 approverId
  operatorId: number; 
}

// 更新请假记录 DTO
export interface UpdateLeaveDto {
  type?: LeaveType;
  startTime?: string;
  endTime?: string;
  reason?: string;
  operatorId: number;
}

// 查询参数 DTO
export interface LeaveQueryDto {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  deptId?: number; // 支持部门递归
  startTime?: string; // 范围查询 start
  endTime?: string;   // 范围查询 end
  type?: LeaveType;
  status?: LeaveStatus;
}

// 列表响应
export type LeaveListResponse = PaginatedResponse<AttLeaveVo>;

// 单条响应
export type LeaveResponse = ApiResponse<AttLeaveVo>;
