
export interface AttendanceRecord {
  id: string;
  staffId: string;
  name: string;
  department: string;
  type: '补签' | '假勤调整';
  correctionTime: string;
  operationTime: string;
}

export interface TreeItem {
  id: string;
  label: string;
  type: 'folder' | 'group' | 'person';
  count?: number;
  children?: TreeItem[];
  isOpen?: boolean;
}

export type TabKey = 'home' | 'access' | 'attendance' | 'hr';
export type MenuKey = 'config' | 'process' | 'stats';
export type SubMenuKey = 'leave' | 'overtime' | 'correction';
