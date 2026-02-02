import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Space, Modal, Form, 
  Select, DatePicker, message, Card, Row, Col, Typography 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getClockRecords, manualClock } from '../../../services/clock';
import { getUsers } from '../../../api/user';
import type { ClockRecord, ClockType, User } from '@attendance/shared';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ClockRecordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClockRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    startTime: dayjs().startOf('day').toISOString(),
    endTime: dayjs().endOf('day').toISOString(),
    employeeId: undefined as number | undefined,
  });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchData();
    loadUsers();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getClockRecords(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取考勤记录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getUsers({ page: 1, pageSize: 100 });
      // @ts-ignore: Assuming res.items exists based on UserList.tsx pattern
      setUsers(res.items || []); 
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const handleManualClock = async () => {
    try {
      const values = await form.validateFields();
      await manualClock({
        employeeId: values.employeeId,
        clockTime: values.clockTime.toISOString(),
        type: values.type,
        source: 'web',
      });
      message.success('补录成功');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('补录失败');
    }
  };

  const columns: ColumnsType<ClockRecord> = [
    {
      title: '员工',
      dataIndex: 'employeeName',
      key: 'employeeName',
      render: (_: any, record: ClockRecord) => record.employeeName || record.employeeId,
    },
    {
      title: '时间',
      dataIndex: 'clockTime',
      key: 'clockTime',
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: ClockType) => (
        <Space>
          {type === 'sign_in' ? '上班' : '下班'}
        </Space>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => loc?.address || '-',
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>原始考勤记录</Title>
          </Col>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setIsModalOpen(true)}
              >
                补录打卡
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchData}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <RangePicker 
            showTime
            defaultValue={[dayjs().startOf('day'), dayjs().endOf('day')]}
            onChange={(dates) => {
              if (dates) {
                setParams({
                  ...params,
                  startTime: dates[0]!.toISOString(),
                  endTime: dates[1]!.toISOString(),
                });
              }
            }}
          />
          <Select
            style={{ width: 200 }}
            placeholder="选择员工"
            allowClear
            onChange={(val) => setParams({ ...params, employeeId: val })}
            options={users.map(u => ({
              label: u.username,
              value: u.id
            }))}
          />
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id"
        loading={loading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: total,
          onChange: (page, pageSize) => setParams({ ...params, page, pageSize }),
        }}
      />

      <Modal
        title="补录打卡"
        open={isModalOpen}
        onOk={handleManualClock}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="employeeId" label="员工" rules={[{ required: true }]}>
            <Select
              options={users.map(u => ({
                label: u.username,
                value: u.id
              }))}
            />
          </Form.Item>
          <Form.Item name="clockTime" label="打卡时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'sign_in', label: '上班' },
                { value: 'sign_out', label: '下班' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ClockRecordPage;
