import React, { useEffect, useState, useCallback } from 'react';
import { 
  Table, Card, Form, Input, Select, DatePicker, 
  Button, Space, Tag, message, Row, Col, Typography 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as correctionService from '../../../services/correction';
import { DepartmentSelect } from '../../../components/DepartmentSelect';
import type { CorrectionDailyRecordVo as DailyRecordVo, AttendanceStatus } from '@attendance/shared';

import { logger } from '../../../utils/logger';

// Force update


const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const statusMap: Record<AttendanceStatus, { text: string; color: string }> = {
  normal: { text: '正常', color: 'success' },
  late: { text: '迟到', color: 'error' },
  early_leave: { text: '早退', color: 'warning' },
  absent: { text: '缺勤', color: 'default' },
  leave: { text: '请假', color: 'processing' },
  business_trip: { text: '出差', color: 'purple' },
};

const AttendanceDetailsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    deptId: undefined as number | undefined,
    employeeName: undefined as string | undefined,
    status: undefined as AttendanceStatus | undefined,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await correctionService.getDailyRecords(params);
      setData(res.items || []);
      setTotal(res.total);
    } catch (error) {
      logger.error('Failed to fetch attendance details', error);
      message.error('获取考勤明细失败');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (values: { dateRange?: [dayjs.Dayjs, dayjs.Dayjs], deptId?: number, employeeName?: string, status?: AttendanceStatus }): void => {
    setParams({
      ...params,
      page: 1,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD') || params.startDate,
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD') || params.endDate,
      deptId: values.deptId,
      employeeName: values.employeeName,
      status: values.status,
    });
  };

  const handleReset = (): void => {
    form.resetFields();
    setParams({
      page: 1,
      pageSize: 10,
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      deptId: undefined,
      employeeName: undefined,
      status: undefined,
    });
  };

  const formatMinutes = (minutes: number): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const columns: ColumnsType<DailyRecordVo> = [
    {
      title: '日期',
      dataIndex: 'workDate',
      key: 'workDate',
      width: 120,
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
      title: '班次',
      dataIndex: 'shiftName',
      key: 'shiftName',
      width: 120,
    },
    {
      title: '规定时间',
      key: 'planTime',
      width: 150,
      render: (_, record) => (
        <span>{record.startTime} - {record.endTime}</span>
      ),
    },
    {
      title: '签到',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      width: 100,
      render: (text) => text ? dayjs(text).format('HH:mm:ss') : '-',
    },
    {
      title: '签退',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      width: 100,
      render: (text) => text ? dayjs(text).format('HH:mm:ss') : '-',
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
      title: '出勤',
      dataIndex: 'workMinutes',
      key: 'workMinutes',
      width: 80,
      render: formatMinutes,
    },
    {
      title: '缺勤',
      dataIndex: 'absentMinutes',
      key: 'absentMinutes',
      width: 80,
      render: formatMinutes,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>每日考勤明细</Title>
        </Col>
        <Col>
          <Space>
            <Button icon={<ExportOutlined />}>导出</Button>
          </Space>
        </Col>
      </Row>

      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        initialValues={{
          dateRange: [dayjs().startOf('month'), dayjs().endOf('month')],
        }}
        style={{ marginBottom: 24 }}
      >
        <Form.Item name="dateRange" label="日期">
          <RangePicker />
        </Form.Item>
        <Form.Item name="deptId" label="部门" style={{ minWidth: 200 }}>
          <DepartmentSelect placeholder="选择部门" />
        </Form.Item>
        <Form.Item name="employeeName" label="姓名">
          <Input placeholder="姓名/工号" allowClear />
        </Form.Item>
        <Form.Item name="status" label="状态" style={{ minWidth: 120 }}>
          <Select placeholder="状态" allowClear>
            {Object.entries(statusMap).map(([key, { text }]) => (
              <Option key={key} value={key}>{text}</Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
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
          current: params.page,
          pageSize: params.pageSize,
          total: total,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, pageSize) => setParams({ ...params, page, pageSize }),
        }}
        scroll={{ x: 1300 }}
      />
    </Card>
  );
};

export default AttendanceDetailsPage;
