
import { AttendanceRecord, TreeItem } from './types';

export const MOCK_RECORDS: AttendanceRecord[] = [
  {
    id: '1',
    staffId: '6CS9NU',
    name: '李云云',
    department: '研发部 / UniCloud 开发组',
    type: '补签',
    correctionTime: '2026/01/14 09:00',
    operationTime: '2026/02/04 14:23',
  },
  {
    id: '2',
    staffId: 'B72J4K',
    name: '张晓明',
    department: '运营部 / 华东大区',
    type: '补签',
    correctionTime: '2026/01/15 08:30',
    operationTime: '2026/02/03 09:12',
  },
  {
    id: '3',
    staffId: '600001',
    name: 'atnd01_dev',
    department: '研发部 / 核心服务组',
    type: '补签',
    correctionTime: '2026/01/14 09:00',
    operationTime: '2026/02/04 14:23',
  }
];

export const MOCK_ORG_TREE: TreeItem[] = [
  {
    id: 'root',
    label: 'atnd01_dev的宇视...',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'group-1',
        label: '11',
        type: 'group',
        count: 11,
        isOpen: true,
        children: [
          { id: 'p1', label: 'atnd01_dev', type: 'person' },
          { id: 'p2', label: '还是', type: 'person' },
          { id: 'p3', label: '11', type: 'person' },
        ]
      }
    ]
  }
];

export const AVATAR_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuAsrx95K8wVi47IYfBLmKepJbfxI3LaRkyke1OSq1iw4LKkwgeNSPL9KKrruaIkKdOuLD4HHF2d8I7qKIlPx80l-Y4wajGu5y-GEXOZUB3BSyYL3iXEIVdf4daVhlh3zdOHbd9aJPrUzFimxDzHg-pEpV_LYHSN6c1tY3y0Abap4Xc4iDvDxySZE37yuq-WVwq_A5EUuCvKMxH13gCqGTA6k6P9fO691LQfiBuXfpoSG-EvUSMtm4jovNQLq95llWN0uTN02u4vEck";
