
import React from 'react';
import { AttendanceGroup, Shift, Device } from './types';

export const MOCK_GROUPS: AttendanceGroup[] = [
  { id: '1', name: '考勤组 01', memberCount: 12, shiftName: '标准班次 (09:00-18:00)', expiryDate: '永久', status: 'valid' },
  { id: '2', name: '技术研发部', memberCount: 45, shiftName: '研发弹性班次', expiryDate: '永久', status: 'valid' },
  { id: '3', name: '临时项目组', memberCount: 5, shiftName: '自由打卡', expiryDate: '2024-12-31', status: 'expired' },
];

export const MOCK_SHIFTS: Shift[] = [
  { id: '1', name: '标准班次', duration: '09:00 - 18:00' },
  { id: '2', name: '早班', duration: '08:00 - 17:00' },
  { id: '3', name: '晚班', duration: '14:00 - 23:00' },
  { id: '4', name: '自由打卡', duration: '不限时间' },
];

export const MOCK_DEVICES: Device[] = [
  { id: '1', name: '前门人脸识别终端 01', sn: 'SN-0012931', status: 'online' },
  { id: '2', name: '后勤办公楼读卡器', sn: 'SN-0092112', status: 'online' },
  { id: '3', name: '车间门禁 03', sn: 'SN-0033221', status: 'offline' },
];
