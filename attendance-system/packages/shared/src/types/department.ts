export interface Department {
  id: number;
  name: string;
  parentId?: number;
  sortOrder: number;
  children?: Department[];
  employeeCount?: number; // 部门人数（含子部门）
}

export interface DepartmentVO {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: DepartmentVO[];
}

export interface CreateDepartmentDto {
  name: string;
  parentId?: number | null;
  sortOrder?: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  parentId?: number | null;
  sortOrder?: number;
}
