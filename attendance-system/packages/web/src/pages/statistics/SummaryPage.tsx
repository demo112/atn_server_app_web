
import React, { useState, useEffect } from 'react';
import { Table, Card, Form, DatePicker, Button, Select, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import request from '../../utils/request';
import { AttendanceSummaryVo, GetSummaryDto } from '@attendance/shared';

const { RangePicker } = DatePicker;

// 简单部门选择 Mock，后续可替换为真实的部门树选择器
const DepartmentSelect = ({ value, onChange }: any) => {
    return (
        <Select 
            value={value} 
            onChange={onChange} 
            placeholder="选择部门" 
            allowClear
            style={{ width: 200 }}
            options={[
                { value: 1, label: '总经办' },
                { value: 2, label: '人事部' },
                { value: 3, label: '研发部' },
                { value: 4, label: '市场部' },
            ]}
        />
    );
};

const SummaryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceSummaryVo[]>([]);
  const [form] = Form.useForm();

  const handleSearch = async (values: any) => {
    try {
      setLoading(true);
      const { dateRange, deptId } = values;
      if (!dateRange || dateRange.length !== 2) {
          message.error('请选择日期范围');
          return;
      }

      const params: GetSummaryDto = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        deptId: deptId,
      };

      const res = await request.get('/statistics/summary', { params });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error(error);
      // message.error('查询失败'); // request utils might handle this
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

    const exportData = data.map(item => ({
      '工号': item.employeeNo,
      '姓名': item.employeeName,
      '部门': item.deptName,
      '应出勤天数': item.totalDays,
      '实际出勤天数': item.actualDays,
      '迟到次数': item.lateCount,
      '迟到时长(分)': item.lateMinutes,
      '早退次数': item.earlyLeaveCount,
      '早退时长(分)': item.earlyLeaveMinutes,
      '缺勤次数': item.absentCount,
      '缺勤时长(分)': item.absentMinutes,
      '请假次数': item.leaveCount,
      '请假时长(分)': item.leaveMinutes,
      '实际出勤时长': item.actualMinutes,
      '有效出勤时长': item.effectiveMinutes,
    }));

    // const ws = XLSX.utils.json_to_sheet(exportData);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, "考勤汇总");
    // XLSX.writeFile(wb, `考勤汇总_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`);
    message.warning('导出功能暂时不可用 (Missing xlsx dependency)');
  };

  useEffect(() => {
     // 默认查询当月
     const start = dayjs().startOf('month');
     const end = dayjs(); 
     form.setFieldsValue({
         dateRange: [start, end]
     });
     handleSearch({ dateRange: [start, end] });
  }, []);

  const columns: ColumnsType<AttendanceSummaryVo> = [
    { title: '工号', dataIndex: 'employeeNo', key: 'employeeNo', fixed: 'left', width: 100 },
    { title: '姓名', dataIndex: 'employeeName', key: 'employeeName', fixed: 'left', width: 100 },
    { title: '部门', dataIndex: 'deptName', key: 'deptName', width: 120 },
    { title: '应出勤(天)', dataIndex: 'totalDays', key: 'totalDays', width: 100 },
    { title: '实出勤(天)', dataIndex: 'actualDays', key: 'actualDays', width: 100 },
    {
        title: '迟到',
        children: [
            { title: '次数', dataIndex: 'lateCount', key: 'lateCount', width: 80 },
            { title: '时长(分)', dataIndex: 'lateMinutes', key: 'lateMinutes', width: 100 },
        ]
    },
    {
        title: '早退',
        children: [
            { title: '次数', dataIndex: 'earlyLeaveCount', key: 'earlyLeaveCount', width: 80 },
            { title: '时长(分)', dataIndex: 'earlyLeaveMinutes', key: 'earlyLeaveMinutes', width: 100 },
        ]
    },
    {
        title: '缺勤',
        children: [
            { title: '次数', dataIndex: 'absentCount', key: 'absentCount', width: 80 },
            { title: '时长(分)', dataIndex: 'absentMinutes', key: 'absentMinutes', width: 100 },
        ]
    },
    {
        title: '请假',
        children: [
            { title: '次数', dataIndex: 'leaveCount', key: 'leaveCount', width: 80 },
            { title: '时长(分)', dataIndex: 'leaveMinutes', key: 'leaveMinutes', width: 100 },
        ]
    },
    { title: '有效工时(分)', dataIndex: 'effectiveMinutes', key: 'effectiveMinutes', width: 120 },
  ];

  return (
    <Card title="考勤汇总">
      <Form form={form} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="dateRange" label="日期范围" rules={[{ required: true }]}>
          <RangePicker />
        </Form.Item>
        <Form.Item name="deptId" label="部门">
          <DepartmentSelect />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                查询
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
                导出
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="employeeId"
        loading={loading}
        scroll={{ x: 1500 }}
        pagination={{ pageSize: 20 }}
      />
    </Card>
  );
};

export default SummaryPage;
