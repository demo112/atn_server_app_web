import { Employee } from './employee';

// ============================================
// 用户/组织模块类型
// ============================================

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  username: string;
  employeeId?: number;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
}

// ============================================
// Auth & User Management DTOs (Added by UA1)
// ============================================

// Auth
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginVo {
  token: string;
  user: {
    id: number;
    username: string;
    role: UserRole;
    name?: string;
    employeeId?: number;
  };
}

export interface MeVo {
  id: number;
  username: string;
  role: UserRole;
  employeeId?: number;
  permissions: string[];
}

// User Management
export interface GetUsersDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: UserStatus;
}

export interface UserListVo {
  items: Array<{
    id: number;
    username: string;
    role: UserRole;
    status: UserStatus;
    employeeName?: string;
    createdAt: string;
  }>;
  total: number;
}

export interface CreateUserDto {
  username: string;
  password?: string;
  role: UserRole;
  employeeId?: number;
}

export interface UpdateUserDto {
  role?: UserRole;
  status?: UserStatus;
}
