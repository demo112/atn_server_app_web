import { Employee } from '../user';
import { Shift } from './base';
import { QueryParams } from '../common';

// ============================================
// 排班管理类型
// ============================================

export interface Schedule {
  id: number;
  employeeId: number;
  shiftId: number;
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
  employee?: Employee;
  shift?: Shift;
}

export interface CreateScheduleDto {
  employeeId: number;
  shiftId: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  force?: boolean;
}

export interface BatchCreateScheduleDto {
  departmentIds: number[];
  shiftId: number;
  startDate: string;
  endDate: string;
  force?: boolean;
  includeSubDepartments?: boolean;
}

export interface ScheduleQueryDto extends QueryParams {
  startDate?: string;
  endDate?: string;
  deptId?: number;
  employeeId?: number;
  shiftId?: number;
}

export interface ScheduleVo extends Schedule {
  shiftName?: string;
  employeeName?: string;
}
