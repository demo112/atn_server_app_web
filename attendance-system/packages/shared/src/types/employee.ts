
// 员工状态枚举
export enum EmployeeStatus {
  Active = 'active',
  Inactive = 'inactive',
  Deleted = 'deleted'
}

export interface Employee {
  id: number;
  employeeNo: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  deptId?: number | null;
  deptName?: string; // 冗余字段，方便显示
  status: EmployeeStatus;
  hireDate?: string;
  leaveDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 员工视图对象
export interface EmployeeVo {
  id: number
  employeeNo: string
  name: string
  phone?: string | null
  email?: string | null
  deptId?: number | null
  deptName?: string // 关联 Department.name
  status: EmployeeStatus
  hireDate?: string | null // YYYY-MM-DD
  userId?: number | null   // 关联的 User ID
  username?: string | null // 关联的 User Username
  createdAt: string
  updatedAt: string
}

// 创建员工 DTO
export interface CreateEmployeeDto {
  employeeNo: string
  name: string
  deptId: number
  hireDate: string // YYYY-MM-DD
  phone?: string
  email?: string
  position?: string // 暂未在 Schema 中定义，预留
}

// 更新员工 DTO
export interface UpdateEmployeeDto {
  name?: string
  deptId?: number
  phone?: string
  email?: string
  hireDate?: string // YYYY-MM-DD
}

// 绑定用户 DTO
export interface BindUserDto {
  userId: number | null // null 表示解绑
}

// 查询员工参数
export interface GetEmployeesDto {
  page?: number
  pageSize?: number
  keyword?: string // name / employeeNo / phone
  deptId?: number
  // status 默认为 active，通常不暴露给前端选择
}
