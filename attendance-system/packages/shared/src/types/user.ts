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

export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: number;
  employeeNo: string;
  name: string;
  phone?: string;
  email?: string;
  deptId?: number;
  deptName?: string; // 冗余字段，方便显示
  status: EmployeeStatus;
  hireDate?: string;
  leaveDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  parentId?: number;
  sortOrder: number;
  children?: Department[];
  employeeCount?: number; // 部门人数（含子部门）
}

// ============================================
// Auth & User Management DTOs (Added by UA1)
// ============================================

// Auth
export interface LoginDto {
  username: string;
  password?: string; // Optional for scenarios where password might not be required or handled differently
}

export interface LoginVo {
  token: string;
  user: {
    id: number;
    username: string;
    role: UserRole;
    name?: string;
  };
}

export interface MeVo {
  id: number;
  username: string;
  role: UserRole;
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
