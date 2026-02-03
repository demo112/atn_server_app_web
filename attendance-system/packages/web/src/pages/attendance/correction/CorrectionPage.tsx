import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Tag, DatePicker } from 'antd';
import { DepartmentTree } from '@/components/common/DepartmentTree';
import * as correctionService from '@/services/correction';
import { CorrectionDailyRecordVo as DailyRecordVo } from '@attendance/shared';
import { CheckInDialog } from './components/CheckInDialog';
import { CheckOutDialog } from './components/CheckOutDialog';
import dayjs from 'dayjs';
import { logger } from '@/utils/logger';

const CorrectionPage: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [records, setRecords] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs()]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyRecordVo | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDeptId, dateRange, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await correctionService.getDailyRecords({
        page,
        pageSize,
        deptId: selectedDeptId ? selectedDeptId : undefined,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      });
      if (res.success && res.data) {
        setRecords(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      logger.error('Failed to load records', err);
      // message.error('加载记录失败'); // Optional: suppress if daily records API not ready
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (record: DailyRecordVo) => {
    setSelectedRecord(record);
    setCheckInOpen(true);
  };

  const handleCheckOut = (record: DailyRecordVo) => {
    setSelectedRecord(record);
    setCheckOutOpen(true);
  };

  const handleSuccess = () => {
    loadData();
    setCheckInOpen(false);
    setCheckOutOpen(false);
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'workDate',
      key: 'workDate',
    },
    {
      title: '员工ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: '签到时间',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
      render: (text: string) => text ? dayjs(text).format('HH:mm:ss') : '-'
    },
    {
      title: '签退时间',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
      render: (text: string) => text ? dayjs(text).format('HH:mm:ss') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          normal: 'green',
          late: 'orange',
          early_leave: 'orange',
          absent: 'red',
        };
        const labels: Record<string, string> = {
          normal: '正常',
          late: '迟到',
          early_leave: '早退',
          absent: '缺勤',
        };
        return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DailyRecordVo) => (
        <Space size="middle">
          {!record.checkInTime && (
            <Button type="link" onClick={() => handleCheckIn(record)}>补签到</Button>
          )}
          {!record.checkOutTime && (
            <Button type="link" onClick={() => handleCheckOut(record)}>补签退</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', height: '100%', gap: '20px' }}>
      {/* Left: Department Tree */}
      <div style={{ width: '250px', flexShrink: 0, borderRight: '1px solid #eee', paddingRight: 20 }}>
        <DepartmentTree onSelect={setSelectedDeptId} />
      </div>

      {/* Right: Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card title="异常考勤处理">
          <Space style={{ marginBottom: 16 }}>
            <DatePicker.RangePicker 
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              allowClear={false}
            />
            <Button type="primary" onClick={loadData}>查询</Button>
          </Space>

          <Table 
            columns={columns} 
            dataSource={records} 
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              total,
              pageSize,
              onChange: p => setPage(p)
            }}
          />
        </Card>
      </div>

      {selectedRecord && (
        <>
          <CheckInDialog 
            isOpen={checkInOpen} 
            onClose={() => setCheckInOpen(false)}
            onSuccess={handleSuccess}
            dailyRecordId={String(selectedRecord?.id || '')}
            employeeName={selectedRecord?.employeeName}
            workDate={selectedRecord?.workDate}
          />
          
          <CheckOutDialog 
            isOpen={checkOutOpen} 
            onClose={() => setCheckOutOpen(false)}
            onSuccess={handleSuccess}
            dailyRecordId={String(selectedRecord?.id || '')}
            employeeName={selectedRecord?.employeeName}
            workDate={selectedRecord?.workDate}
          />
        </>
      )}
    </div>
  );
};

export default CorrectionPage;
