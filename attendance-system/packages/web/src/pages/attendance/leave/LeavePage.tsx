import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Card, Tag, Input, Select, DatePicker, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { LeaveVo, LeaveType, LeaveStatus } from '@attendance/shared';
import * as leaveService from '@/services/leave';
import { LeaveDialog } from './components/LeaveDialog';
import dayjs from 'dayjs';
import { logger } from '@/utils/logger';

const LeavePage: React.FC = () => {
  const [data, setData] = useState<LeaveVo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveVo | undefined>(undefined);
  
  // Filters
  const [filters, setFilters] = useState({
    employeeId: undefined as number | undefined,
    type: undefined as LeaveType | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dateRange: null as any
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leaveService.getLeaves({
        page,
        pageSize: 10,
        employeeId: filters.employeeId,
        type: filters.type,
        startTime: filters.dateRange ? filters.dateRange[0].toISOString() : undefined,
        endTime: filters.dateRange ? filters.dateRange[1].toISOString() : undefined,
      });
      setData(res.items || []);
      setTotal(res.total);
    } catch (error) {
      logger.error('Failed to fetch leaves', error);
      message.error('加载请假列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = (): void => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: LeaveVo): void => {
    if (item.status === LeaveStatus.cancelled) {
      message.warning('已撤销记录不可编辑');
      return;
    }
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleCancel = async (id: number): Promise<void> => {
    Modal.confirm({
      title: '确认撤销',
      content: '确定要撤销这条记录吗？',
      onOk: async () => {
        try {
          await leaveService.cancelLeave(id);
          message.success('撤销成功');
          fetchData();
        } catch (err) {
          logger.error('Leave cancellation failed', err);
          message.error('撤销失败');
        }
      }
    });
  };

  const columns = [
    {
      title: '员工ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: LeaveType) => {
        const colors: Record<string, string> = {
          [LeaveType.annual]: 'blue',
          [LeaveType.sick]: 'orange',
          [LeaveType.personal]: 'cyan',
          [LeaveType.business_trip]: 'green',
          [LeaveType.other]: 'default'
        };
        const labels: Record<string, string> = {
          [LeaveType.annual]: '年假',
          [LeaveType.sick]: '病假',
          [LeaveType.personal]: '事假',
          [LeaveType.business_trip]: '出差',
          [LeaveType.other]: '其他'
        };
        return <Tag color={colors[type]}>{labels[type] || type}</Tag>;
      }
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '时长(小时)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: LeaveStatus) => {
        const colors: Record<string, string> = {
          [LeaveStatus.pending]: 'gold',
          [LeaveStatus.approved]: 'green',
          [LeaveStatus.rejected]: 'red',
          [LeaveStatus.cancelled]: 'default'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: LeaveVo) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleCancel(record.id)}>撤销</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="请假/出差管理" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
        申请请假
      </Button>
    }>
      <Space style={{ marginBottom: 16 }}>
        <Input 
          placeholder="员工ID" 
          type="number"
          allowClear
          onChange={e => setFilters({...filters, employeeId: e.target.value ? Number(e.target.value) : undefined})} 
        />
        <Select 
          placeholder="请假类型" 
          allowClear 
          style={{ width: 120 }}
          onChange={val => setFilters({...filters, type: val})}
          options={[
            { value: LeaveType.annual, label: '年假' },
            { value: LeaveType.sick, label: '病假' },
            { value: LeaveType.personal, label: '事假' },
            { value: LeaveType.business_trip, label: '出差' },
            { value: LeaveType.other, label: '其他' }
          ]}
        />
        <DatePicker.RangePicker 
          showTime
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(dates: any) => setFilters({...filters, dateRange: dates})}
        />
        <Button type="primary" onClick={() => setPage(1)}>查询</Button>
      </Space>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: p => setPage(p)
        }}
      />

      <LeaveDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchData();
        }}
        initialData={selectedItem}
      />
    </Card>
  );
};

export default LeavePage;
