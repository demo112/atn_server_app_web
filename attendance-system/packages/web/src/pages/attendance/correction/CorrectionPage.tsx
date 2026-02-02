import React, { useState, useEffect } from 'react';
import { DepartmentTree } from '@/components/common/DepartmentTree';
import { attendanceCorrectionService } from '@/services/attendance-correction';
import { DailyRecordVo } from '@attendance/shared';
import { CheckInDialog } from './components/CheckInDialog';
import { CheckOutDialog } from './components/CheckOutDialog';

const CorrectionPage: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [records, setRecords] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyRecordVo | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedDeptId, startDate, endDate, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await attendanceCorrectionService.getDailyRecords({
        page,
        pageSize,
        deptId: selectedDeptId ? selectedDeptId : undefined,
        startDate,
        endDate
      });
      if (res.data) {
        setRecords(res.data);
        setTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load records', err);
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

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'green';
      case 'late': return 'orange';
      case 'early_leave': return 'orange';
      case 'absent': return 'red';
      default: return 'black';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: '20px', padding: '10px' }}>
      {/* Left: Department Tree */}
      <div style={{ width: '250px', flexShrink: 0, borderRight: '1px solid #eee' }}>
        <DepartmentTree onSelect={setSelectedDeptId} />
      </div>

      {/* Right: Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>异常考勤处理</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>日期范围:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              style={{ padding: '4px' }}
            />
            <span>至</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              style={{ padding: '4px' }}
            />
            <button 
              onClick={loadData}
              style={{ padding: '4px 12px', cursor: 'pointer', marginLeft: '10px' }}
            >
              查询
            </button>
          </div>
        </header>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
            <thead style={{ backgroundColor: '#fafafa' }}>
              <tr>
                <th style={thStyle}>日期</th>
                <th style={thStyle}>姓名</th>
                <th style={thStyle}>部门</th>
                <th style={thStyle}>班次</th>
                <th style={thStyle}>签到时间</th>
                <th style={thStyle}>签退时间</th>
                <th style={thStyle}>状态</th>
                <th style={thStyle}>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>加载中...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>暂无数据</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tdStyle}>{new Date(record.workDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>{record.employeeName}</td>
                    <td style={tdStyle}>{record.deptName}</td>
                    <td style={tdStyle}>{record.shiftName}</td>
                    <td style={tdStyle}>{formatTime(record.checkInTime)}</td>
                    <td style={tdStyle}>{formatTime(record.checkOutTime)}</td>
                    <td style={{ ...tdStyle, color: getStatusColor(record.status) }}>
                      {record.status}
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => handleCheckIn(record)}
                        style={{ marginRight: '5px', cursor: 'pointer' }}
                      >
                        补签到
                      </button>
                      <button 
                        onClick={() => handleCheckOut(record)}
                        style={{ cursor: 'pointer' }}
                      >
                        补签退
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            上一页
          </button>
          <span>第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页 (总数: {total})</span>
          <button 
            disabled={page * pageSize >= total} 
            onClick={() => setPage(p => p + 1)}
          >
            下一页
          </button>
        </div>
      </div>

      {/* Dialogs */}
      {selectedRecord && (
        <>
          <CheckInDialog 
            isOpen={checkInOpen} 
            onClose={() => setCheckInOpen(false)} 
            onSuccess={loadData}
            dailyRecordId={selectedRecord.id}
            employeeName={selectedRecord.employeeName}
            workDate={new Date(selectedRecord.workDate).toLocaleDateString()}
          />
          <CheckOutDialog 
            isOpen={checkOutOpen} 
            onClose={() => setCheckOutOpen(false)} 
            onSuccess={loadData}
            dailyRecordId={selectedRecord.id}
            employeeName={selectedRecord.employeeName}
            workDate={new Date(selectedRecord.workDate).toLocaleDateString()}
          />
        </>
      )}
    </div>
  );
};

const thStyle = { padding: '12px', textAlign: 'left' as const, borderBottom: '1px solid #ddd' };
const tdStyle = { padding: '12px' };

export default CorrectionPage;
