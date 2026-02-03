import React, { useState, useEffect, useCallback } from 'react';
import { Form, DatePicker, Button, Select, message, Space, Card } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDeptStats, getChartStats, exportStats } from '@/api/statistics';
import { DeptStatsVo, ChartStatsVo } from '@attendance/shared';
import DeptStatsTable from './components/DeptStatsTable';
import AttendanceCharts from './components/AttendanceCharts';
import { logger } from '@/utils/logger';

const { RangePicker } = DatePicker;

// Mock Department Select (Reuse from SummaryPage or create shared component later)
interface DepartmentSelectProps {
    value?: number;
    onChange?: (value: number) => void;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ value, onChange }): React.ReactElement => {
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

const ReportPage: React.FC = (): React.ReactElement => {
  const [loading, setLoading] = useState(false);
  const [deptStats, setDeptStats] = useState<DeptStatsVo[]>([]);
  const [chartStats, setChartStats] = useState<ChartStatsVo>({ dailyTrend: [], statusDistribution: [] });
  // Removed unused activeTab
  
  const [form] = Form.useForm();

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      const { month, dateRange, deptId } = values;
      
      const monthStr = month ? month.format('YYYY-MM') : dayjs().format('YYYY-MM');
      const startDate = dateRange ? dateRange[0].format('YYYY-MM-DD') : dayjs().startOf('month').format('YYYY-MM-DD');
      const endDate = dateRange ? dateRange[1].format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');

      // Fetch Dept Stats (Monthly)
      const deptRes = await getDeptStats({ month: monthStr, deptId });
      if (deptRes.success && deptRes.data) {
        setDeptStats(deptRes.data);
      }

      // Fetch Chart Stats (Date Range)
      const chartRes = await getChartStats({ startDate, endDate, deptId });
      if (chartRes.success && chartRes.data) {
        setChartStats(chartRes.data);
      }

    } catch (error) {
      logger.error('Failed to fetch statistics', error);
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    // Default to current month
    const initialValues = {
        month: dayjs(),
        dateRange: [dayjs().startOf('month'), dayjs()],
        deptId: undefined
    };
    // Initial fetch
    form.setFieldsValue(initialValues);
    fetchData();
  }, [fetchData, form]);

  const handleExport = async (): Promise<void> => {
    try {
      const values = form.getFieldsValue();
      const { month, deptId } = values;
      const monthStr = month ? month.format('YYYY-MM') : dayjs().format('YYYY-MM');
      
      const response = await exportStats({ month: monthStr, deptId });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_stats_${monthStr}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      logger.error('Failed to export statistics', error);
      message.error('导出失败');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card variant="borderless" style={{ marginBottom: 24 }}>
        <Form form={form} layout="inline" onFinish={fetchData} initialValues={initialValues}>
          <Form.Item name="month" label="统计月份" rules={[{ required: true }]}>
            <DatePicker picker="month" />
          </Form.Item>
          <Form.Item name="dateRange" label="图表日期范围">
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
                导出报表
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <AttendanceCharts data={chartStats} loading={loading} />
      <DeptStatsTable data={deptStats} loading={loading} />
    </div>
  );
};

export default ReportPage;
