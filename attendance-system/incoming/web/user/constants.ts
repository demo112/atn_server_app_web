
import { User, UserStatus } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: '11',
    phone: '18666555514',
    department: 'atnd01_dev的宇视云',
    employeeId: '11',
    role: '',
    status: UserStatus.PENDING
  },
  {
    id: '2',
    name: 'atnd01_dev',
    phone: '18660845170',
    department: 'atnd01_dev的宇视云',
    employeeId: '6CS9Nu',
    role: '',
    status: UserStatus.JOINED
  },
  {
    id: '3',
    name: '还是',
    phone: '15764151362',
    department: 'atnd01_dev的宇视云',
    employeeId: '447',
    role: '',
    status: UserStatus.JOINED
  }
];

export const DEPARTMENTS = [
  'atnd01_dev的宇视云',
  '研发中心',
  '市场部',
  '人事部',
  '财务部'
];

export const ROLES = [
  { value: 'admin', label: '系统管理员' },
  { value: 'hr', label: '人事主管' },
  { value: 'user', label: '普通员工' }
];
