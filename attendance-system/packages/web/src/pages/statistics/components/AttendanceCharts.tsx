import React from 'react';
import { Card, Row, Col } from 'antd';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { ChartStatsVo } from '@attendance/shared';

interface Props {
  data: ChartStatsVo;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4D4F'];

const AttendanceCharts: React.FC<Props> = ({ data, loading = false }) => {
  const { dailyTrend, statusDistribution } = data;

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={24}>
        <Col span={16}>
          <Card title="每日出勤率趋势" loading={loading} bordered={false}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyTrend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendanceRate" name="出勤率" stroke="#1890ff" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="考勤状态分布" loading={loading} bordered={false}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status" // Note: status is key like 'normal', might want to map to Chinese
                  >
                    {statusDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AttendanceCharts;
