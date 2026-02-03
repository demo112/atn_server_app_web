import React, { useState, useEffect } from 'react';
import { Table, Card, Form, Input, DatePicker, Select, Button, Tag, Space, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DailyRecordVo, AttendanceStatus } from '@attendance/shared';
import { getDailyRecords, triggerCalculation } from '../../api/statistics';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const statusMap: Record<AttendanceStatus, { text: string; color: string }> = {
  normal: { text: '正常', color: 'success' },
  late: { text: '迟到', color: 'warning' },
  early_leave: { text: '早退', color: 'warning' },
  absent: { text: '缺勤', color: 'error' },
  leave: { text: '请假', color: 'default' },
  business_trip: { text: '出差', color: 'processing' },
};

const DailyRecords: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [recalcModalVisible, setRecalcModalVisible] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcForm] = Form.useForm();

  const fetchRecords = async (page = 1, size = 20) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const params: any = {
        page,
        pageSize: size,
        ...values,
      };

      if (values.dateRange) {
        params.startDate = values.dateRange[0].format('YYYY-MM-DD');
        params.endDate = values.dateRange[1].format('YYYY-MM-DD');
        delete params.dateRange;
      }

      const res = await getDailyRecords(params);
      if (res.success) {
        setData(res.data.items);
        setTotal(res.data.total);
        setCurrentPage(page);
        setPageSize(size);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
      message.error('获取考勤记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleRecalculate = async () => {
    try {
      const values = await recalcForm.validateFields();
      setRecalcLoading(true);
      
      const params = {
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        employeeIds: values.employeeIds ? values.employeeIds.split(',').map((id: string) => Number(id.trim())) : undefined,
      };

      const res = await triggerCalculation(params);
      if (res.success) {
        message.success('重算任务已触发');
        setRecalcModalVisible(false);
        fetchRecords(currentPage, pageSize);
      }
    } catch (error) {
      console.error('Recalculation failed:', error);
      message.error('触发重算失败');
    } finally {
      setRecalcLoading(false);
    }
  };

  const columns: ColumnsType<DailyRecordVo> = [
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 100,
    },
    {
      title: '部门',
      dataIndex: 'deptName',
      key: 'deptName',
      width: 120,
    },
    {
      title: '日期',
      dataIndex: 'workDate',
      key: 'workDate',
      width: 120,
    },
    {
      title: '班次',
      dataIndex: 'shiftName',
      key: 'shiftName',
      width: 120,
    },
    {
      title: '签到时间',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '签退时间',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      width: 180,
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AttendanceStatus) => {
        const config = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '异常时长(分)',
      key: 'abnormal',
      width: 200,
      render: (_, record) => {
        const items = [];
        if (record.lateMinutes > 0) items.push(`迟到${record.lateMinutes}`);
        if (record.earlyLeaveMinutes > 0) items.push(`早退${record.earlyLeaveMinutes}`);
        if (record.absentMinutes > 0) items.push(`缺勤${record.absentMinutes}`);
        if (record.leaveMinutes > 0) items.push(`请假${record.leaveMinutes}`);
        return items.length > 0 ? items.join(', ') : '-';
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="考勤明细" extra={
        user?.role === 'admin' && (
          <Button type="primary" onClick={() => setRecalcModalVisible(true)}>
            手动重算
          </Button>
        )
      }>
        <Form form={form} layout="inline" style={{ marginBottom: 24 }} onFinish={() => fetchRecords(1, pageSize)}>
          <Form.Item name="dateRange" label="日期范围">
            <RangePicker />
          </Form.Item>
          {user?.role === 'admin' && (
            <>
              <Form.Item name="employeeName" label="员工姓名">
                <Input placeholder="请输入姓名" allowClear />
              </Form.Item>
              <Form.Item name="deptId" label="部门ID">
                <Input placeholder="请输入部门ID" allowClear />
              </Form.Item>
            </>
          )}
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
              {Object.entries(statusMap).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                查询
              </Button>
              <Button onClick={() => {
                form.resetFields();
                fetchRecords(1, pageSize);
              }}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: fetchRecords,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Modal
        title="手动重算考勤"
        open={recalcModalVisible}
        onOk={handleRecalculate}
        onCancel={() => setRecalcModalVisible(false)}
        confirmLoading={recalcLoading}
      >
        <Form form={recalcForm} layout="vertical">
          <Form.Item 
            name="dateRange" 
            label="重算日期范围" 
            rules={[{ required: true, message: '请选择日期范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item 
            name="employeeIds" 
            label="员工ID列表 (可选)" 
            help="多个ID用逗号分隔，不填则重算所有员工"
          >
            <Input placeholder="例如: 1, 2, 3" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DailyRecords;
