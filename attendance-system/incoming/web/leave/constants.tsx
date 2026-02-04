
import { LeaveRequest, LeaveType, LeaveSubType, OrgNode } from './types';

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '6CS9Nu',
    employeeName: 'atnd01_dev',
    department: 'atnd01_dev的宇视',
    startTime: '2026-02-04 09:00',
    endTime: '2026-02-04 18:00',
    type: LeaveType.LEAVE,
    subType: LeaveSubType.SICK,
    applyTime: '2026-02-04 11:22',
    note: '11',
    duration: 540,
    status: 'approved'
  },
  {
    id: '2',
    employeeId: '8KF2Mj',
    employeeName: 'zhang_san',
    department: '研发部',
    startTime: '2026-02-05 08:30',
    endTime: '2026-02-06 17:30',
    type: LeaveType.TRIP,
    subType: LeaveSubType.OTHER,
    applyTime: '2026-02-03 14:10',
    note: '客户现场支持',
    duration: 1500,
    status: 'approved'
  }
];

export const ORG_TREE: OrgNode[] = [
  {
    id: 'dept-1',
    name: 'atnd01_dev的宇...',
    type: 'dept',
    children: [
      {
        id: 'group-1',
        name: '11',
        type: 'group',
        memberCount: 11,
        children: [
          { id: 'user-1', name: 'atnd01_dev', type: 'user' },
          { id: 'user-2', name: '还是', type: 'user' },
          { id: 'user-3', name: '11', type: 'user' }
        ]
      }
    ]
  }
];
