import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, 
  Select, InputNumber, message, Card, Row, Col, Typography, Divider 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { getShifts, createShift, updateShift, deleteShift, getShift } from '../../../services/shift';
import { getTimePeriods } from '../../../services/time-period';
import type { Shift, TimePeriod, CreateShiftDto } from '@attendance/shared';

const { Title } = Typography;

const ShiftPage: React.FC = (): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [periods, setPeriods] = useState<TimePeriod[]>([]);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [form] = Form.useForm();

  // Days configuration for the form
  const [days, setDays] = useState<{ dayOfCycle: number; periodIds: number[] }[]>([]);

  const fetchShifts = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await getShifts();
      setShifts(data);
    } catch {
      message.error('获取班次列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPeriods = useCallback(async (): Promise<void> => {
    try {
      const data = await getTimePeriods();
      setPeriods(data);
    } catch {
      message.error('获取时间段失败');
    }
  }, []);

  useEffect(() => {
    fetchShifts();
    fetchPeriods();
  }, [fetchShifts, fetchPeriods]);

  const handleEdit = async (shift: Shift): Promise<void> => {
    try {
      const detail = await getShift(shift.id);
      setCurrentShift(detail);
      
      // Transform periods to days format for form
      const daysMap = new Map<number, number[]>();
      detail.periods?.forEach(p => {
        const list = daysMap.get(p.dayOfCycle) || [];
        list.push(p.periodId);
        daysMap.set(p.dayOfCycle, list);
      });
      
      const daysData = Array.from(daysMap.entries()).map(([day, pIds]) => ({
        dayOfCycle: day,
        periodIds: pIds
      }));
      setDays(daysData);

      form.setFieldsValue({
        name: detail.name,
        cycleDays: detail.cycleDays,
      });
      setIsModalOpen(true);
    } catch {
      message.error('获取详情失败');
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个班次吗？',
      onOk: async () => {
        try {
          await deleteShift(id);
          message.success('删除成功');
          fetchShifts();
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleModalOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      const periods: { periodId: number; dayOfCycle: number }[] = [];
      days.forEach(d => {
        d.periodIds.forEach(pid => {
          periods.push({
            periodId: pid,
            dayOfCycle: d.dayOfCycle
          });
        });
      });

      const dto: CreateShiftDto = {
        name: values.name,
        cycleDays: values.cycleDays,
        periods: periods,
      };

      if (currentShift) {
        await updateShift(currentShift.id, dto);
        message.success('更新成功');
      } else {
        await createShift(dto);
        message.success('创建成功');
      }
      setIsModalOpen(false);
      fetchShifts();
    } catch {
      message.error('保存失败');
    }
  };

  const handleOpenCreate = (): void => {
    setCurrentShift(null);
    setDays([]);
    form.resetFields();
    form.setFieldsValue({ cycleDays: 7 });
    setIsModalOpen(true);
  };

  const updateDayPeriods = (day: number, periodIds: number[]): void => {
    const newDays = days.filter(d => d.dayOfCycle !== day);
    if (periodIds.length > 0) {
      newDays.push({ dayOfCycle: day, periodIds });
    }
    setDays(newDays);
  };

  const columns: ColumnsType<Shift> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '班次名称', dataIndex: 'name', key: 'name' },
    { title: '周期(天)', dataIndex: 'cycleDays', key: 'cycleDays', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const cycleDays = Form.useWatch('cycleDays', form) || 7;

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col><Title level={4}>班次管理</Title></Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              新建班次
            </Button>
          </Col>
        </Row>
      </div>

      <Table 
        columns={columns} 
        dataSource={shifts} 
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={currentShift ? '编辑班次' : '新建班次'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="班次名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cycleDays" label="周期天数" rules={[{ required: true }]}>
            <InputNumber min={1} max={31} />
          </Form.Item>
          
          <Divider orientation="left">每日时间段配置</Divider>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {Array.from({ length: cycleDays }).map((_, index) => {
              const day = index + 1;
              const currentDayConfig = days.find(d => d.dayOfCycle === day);
              const currentPeriodIds = currentDayConfig?.periodIds || [];

              return (
                <Row key={day} gutter={16} style={{ marginBottom: 8, alignItems: 'center' }}>
                  <Col span={4}>第 {day} 天</Col>
                  <Col span={20}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="选择时间段"
                      value={currentPeriodIds}
                      onChange={(ids) => updateDayPeriods(day, ids)}
                      options={periods.map(p => ({
                        label: `${p.name} (${p.startTime}-${p.endTime})`,
                        value: p.id
                      }))}
                    />
                  </Col>
                </Row>
              );
            })}
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default ShiftPage;
