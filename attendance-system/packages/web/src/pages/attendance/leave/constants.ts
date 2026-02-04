
import { LeaveRequestUI, LeaveTypeUI, LeaveSubTypeUI, OrgNode } from './types_ui';

export const ORG_TREE: OrgNode[] = [
  {
    id: 'dept-1',
    name: '宇视云',
    type: 'dept',
    children: [
      {
        id: 'dept-2',
        name: '研发部',
        type: 'dept',
        children: [
          { id: 'group-1', name: '前端组', type: 'group', memberCount: 5 },
          { id: 'group-2', name: '后端组', type: 'group', memberCount: 6 }
        ]
      },
      {
        id: 'dept-3',
        name: '人事部',
        type: 'dept',
        memberCount: 3
      }
    ]
  }
];

// 初始数据仅用于演示或作为占位符
export const INITIAL_LEAVE_REQUESTS: LeaveRequestUI[] = [
  {
    id: '1',
    employeeId: '6CS9Nu',
    employeeName: 'atnd01_dev',
    department: '研发部',
    startTime: '2026-02-04 09:00',
    endTime: '2026-02-04 18:00',
    type: LeaveTypeUI.LEAVE,
    subType: LeaveSubTypeUI.SICK,
    applyTime: '2026-02-04 11:22',
    note: '身体不适',
    duration: 540,
    status: 'approved'
  }
];
