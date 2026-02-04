import React, { useState, useEffect, useCallback } from 'react';
import { DepartmentTree } from '@/components/common/DepartmentTree';
import * as correctionService from '@/services/correction';
import { CorrectionDailyRecordVo as DailyRecordVo } from '@attendance/shared';
import { CheckInDialog } from './components/CheckInDialog';
import { CheckOutDialog } from './components/CheckOutDialog';
import dayjs from 'dayjs';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/common/ToastProvider';

const CorrectionPage: React.FC = () => {
  const { error } = useToast();
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [records, setRecords] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [startDate, setStartDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyRecordVo | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await correctionService.getDailyRecords({
        page,
        pageSize,
        deptId: selectedDeptId ? selectedDeptId : undefined,
        startDate,
        endDate
      });
      setRecords(res.items);
      setTotal(res.total);
    } catch (err) {
      logger.error('Failed to load records', err);
      // error('加载记录失败'); // Optional
    } finally {
      setLoading(false);
    }
  }, [page, selectedDeptId, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheckIn = (record: DailyRecordVo): void => {
    setSelectedRecord(record);
    setCheckInOpen(true);
  };

  const handleCheckOut = (record: DailyRecordVo): void => {
    setSelectedRecord(record);
    setCheckOutOpen(true);
  };

  const handleSuccess = (): void => {
    loadData();
    setCheckInOpen(false);
    setCheckOutOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      normal: 'bg-green-100 text-green-800',
      late: 'bg-orange-100 text-orange-800',
      early_leave: 'bg-orange-100 text-orange-800',
      absent: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      normal: '正常',
      late: '迟到',
      early_leave: '早退',
      absent: '缺勤',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="flex h-full gap-5">
      {/* Left: Department Tree */}
      <div className="w-[250px] shrink-0 border-r border-gray-200 pr-5">
        <DepartmentTree onSelect={setSelectedDeptId} />
      </div>

      {/* Right: Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">异常考勤处理</h2>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">日期范围:</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <button 
                onClick={loadData}
                className="inline-flex items-center px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <span className="material-icons text-sm mr-1">search</span>
                查询
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">签到时间</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">签退时间</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p>加载中...</p>
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                      <span className="material-icons text-4xl block mb-2 mx-auto text-gray-300">inbox</span>
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.workDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.employeeId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkInTime ? dayjs(record.checkInTime).format('HH:mm:ss') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.checkOutTime ? dayjs(record.checkOutTime).format('HH:mm:ss') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          {!record.checkInTime && (
                            <button 
                              onClick={() => handleCheckIn(record)}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              补签到
                            </button>
                          )}
                          {!record.checkOutTime && (
                            <button 
                              onClick={() => handleCheckOut(record)}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              补签退
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  显示 <span className="font-medium">{(page - 1) * pageSize + 1}</span> 到 <span className="font-medium">{Math.min(page * pageSize, total)}</span> 条，共 <span className="font-medium">{total}</span> 条
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= total}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <span className="material-icons text-sm">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
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
