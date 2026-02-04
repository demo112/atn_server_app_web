
export enum UserStatus {
  PENDING = '待加入',
  JOINED = '已加入'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  department: string;
  employeeId: string;
  role: string;
  status: UserStatus;
}

export type ModalType = 'add' | 'edit' | null;

export interface NavItem {
  id: string;
  label: string;
  icon?: string;
}
