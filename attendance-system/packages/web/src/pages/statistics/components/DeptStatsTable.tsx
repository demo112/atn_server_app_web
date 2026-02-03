import React from 'react';
import { Table, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeptStatsVo } from '@attendance/shared';

interface Props {
  data: DeptStatsVo[];
  loading?: boolean;
}

const DeptStatsTable: React.FC<Props> = ({ data, loading = false }) => {
  const columns: ColumnsType<DeptStatsVo> = [
    {
      title: '部门',
      dataIndex: 'deptName',
      key: 'deptName',
    },
    {
      title: '总人数',
      dataIndex: 'totalHeadcount',
      key: 'totalHeadcount',
      sorter: (a, b) => a.totalHeadcount - b.totalHeadcount,
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      render: (val) => `${val}%`,
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: '正常',
      dataIndex: 'normalCount',
      key: 'normalCount',
    },
    {
      title: '迟到',
      dataIndex: 'lateCount',
      key: 'lateCount',
      render: (val) => <span style={{ color: val > 0 ? '#faad14' : 'inherit' }}>{val}</span>,
      sorter: (a, b) => a.lateCount - b.lateCount,
    },
    {
      title: '早退',
      dataIndex: 'earlyLeaveCount',
      key: 'earlyLeaveCount',
      render: (val) => <span style={{ color: val > 0 ? '#faad14' : 'inherit' }}>{val}</span>,
    },
    {
      title: '缺勤',
      dataIndex: 'absentCount',
      key: 'absentCount',
      render: (val) => <span style={{ color: val > 0 ? '#ff4d4f' : 'inherit' }}>{val}</span>,
      sorter: (a, b) => a.absentCount - b.absentCount,
    },
    {
      title: '请假',
      dataIndex: 'leaveCount',
      key: 'leaveCount',
    },
  ];

  return (
    <Card title="部门考勤统计" bordered={false}>
      <Table
        rowKey="deptId"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
};

export default DeptStatsTable;
