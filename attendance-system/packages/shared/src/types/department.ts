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
