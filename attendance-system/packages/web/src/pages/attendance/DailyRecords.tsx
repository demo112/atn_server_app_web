import React, { useState, useEffect, useCallback } from 'react';
import { CorrectionDailyRecordVo as DailyRecordVo, AttendanceStatus, QueryDailyRecordsDto } from '@attendance/shared';
import { getDailyRecords, triggerCalculation, getRecalculationStatus } from '../../services/statistics';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../utils/logger';
import dayjs from 'dayjs';
import StandardModal from '@/components/common/StandardModal';
import { useToast } from '@/components/common/ToastProvider';

const statusMap: Record<AttendanceStatus, { text: string; color: string; bgColor: string }> = {
  normal: { text: '正常', color: 'text-green-800', bgColor: 'bg-green-100' },
  late: { text: '迟到', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  early_leave: { text: '早退', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  absent: { text: '缺勤', color: 'text-red-800', bgColor: 'bg-red-100' },
  leave: { text: '请假', color: 'text-gray-800', bgColor: 'bg-gray-100' },
  business_trip: { text: '出差', color: 'text-blue-800', bgColor: 'bg-blue-100' },
};

const DailyRecords: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  
  // Search Params
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    startDate: '',
    endDate: '',
    employeeName: '',
    deptId: '',
    status: '' as AttendanceStatus | '',
  });

  // Recalc Modal State
  const [recalcModalVisible, setRecalcModalVisible] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcForm, setRecalcForm] = useState({
    startDate: '',
    endDate: '',
    employeeIds: '',
  });

  const fetchRecords = useCallback(async (page = filters.page, size = filters.pageSize): Promise<void> => {
    setLoading(true);
    try {
      const params: QueryDailyRecordsDto = {
        page,
        pageSize: size,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        employeeName: filters.employeeName || undefined,
        deptId: filters.deptId ? Number(filters.deptId) : undefined,
        status: filters.status || undefined,
      };

      const res = await getDailyRecords(params);
      setData(res.items);
      setTotal(res.total);
      // Update filters with current page/size if they changed
      if (page !== filters.page || size !== filters.pageSize) {
          setFilters(prev => ({ ...prev, page, pageSize: size }));
      }
    } catch (error) {
      logger.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.employeeName, filters.deptId, filters.status]);

  useEffect(() => {
    fetchRecords(1, 20);
  }, []); // Initial load

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(1, filters.pageSize);
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      pageSize: 20,
      startDate: '',
      endDate: '',
      employeeName: '',
      deptId: '',
      status: '',
    });
    // Trigger fetch after state update (handled by next effect or manual call)
    // Since state update is async, we can just call fetch with default params
    // But better to let the user click search or use effect.
    // Let's just reset state and call fetch.
    setTimeout(() => {
        // Need to pass the reset values explicitly because state might not be updated yet
        // Actually, simpler to just set state and add fetchRecords to a useEffect dependent on filters?
        // No, that causes too many fetches. Just fetch manually.
         getDailyRecords({ page: 1, pageSize: 20 }).then(res => {
            setData(res.items);
            setTotal(res.total);
         });
    }, 0);
  };

  const handleRecalculate = async (): Promise<void> => {
    if (!recalcForm.startDate || !recalcForm.endDate) {
      toast.error('请选择日期范围');
      return;
    }
    setRecalcLoading(true);
    try {
      const params = {
        startDate: recalcForm.startDate,
        endDate: recalcForm.endDate,
        employeeIds: recalcForm.employeeIds ? recalcForm.employeeIds.split(',').map((id: string) => Number(id.trim())) : undefined,
      };

      const batchId = await triggerCalculation(params);
      
      const poll = async () => {
        try {
          const status = await getRecalculationStatus(batchId);
          if (status.status === 'completed' || status.status === 'completed_with_errors') {
            setRecalcModalVisible(false);
            setRecalcLoading(false);
            if (status.status === 'completed_with_errors') {
              toast.error(status.message || '重算完成，但有部分失败');
            } else {
              toast.success('重新计算完成');
            }
            fetchRecords(filters.page, filters.pageSize);
          } else if (status.status === 'failed') {
            setRecalcLoading(false);
            toast.error(status.message || '重算失败');
          } else {
            setTimeout(poll, 1000);
          }
        } catch (error) {
          logger.error('Polling failed', error);
          toast.error('查询计算进度失败');
          setRecalcLoading(false);
        }
      };
      
      poll();
    } catch (error) {
      logger.error('Recalculation failed', error);
      toast.error('触发重算失败');
      setRecalcLoading(false);
    }
  };

  const renderAbnormal = (record: DailyRecordVo) => {
    const items = [];
    const late = record.lateMinutes || 0;
    const early = record.earlyLeaveMinutes || 0;
    const absent = record.absentMinutes || 0;
    const leave = record.leaveMinutes || 0;

    if (late > 0) items.push(`迟到${late}`);
    if (early > 0) items.push(`早退${early}`);
    if (absent > 0) items.push(`缺勤${absent}`);
    if (leave > 0) items.push(`请假${leave}`);
    return items.length > 0 ? items.join(', ') : '-';
  };

  const recalcFooter = (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={() => setRecalcModalVisible(false)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        取消
      </button>
      <button
        onClick={handleRecalculate}
        disabled={recalcLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {recalcLoading ? '计算中...' : '开始重算'}
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">考勤明细</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => setRecalcModalVisible(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="material-icons mr-2 text-sm">calculate</span>
              手动重算
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const newFilters = { ...filters, startDate: newDate };
                  if (filters.endDate && newDate > filters.endDate) {
                    newFilters.endDate = newDate;
                  }
                  setFilters(newFilters);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const newFilters = { ...filters, endDate: newDate };
                  if (filters.startDate && newDate < filters.startDate) {
                    newFilters.startDate = newDate;
                  }
                  setFilters(newFilters);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
              />
            </div>
            
            {user?.role === 'admin' && (
              <>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">员工姓名</label>
                  <input
                    type="text"
                    value={filters.employeeName}
                    onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                    placeholder="输入姓名"
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">部门ID</label>
                  <input
                    type="text"
                    value={filters.deptId}
                    onChange={(e) => setFilters({ ...filters, deptId: e.target.value })}
                    placeholder="输入部门ID"
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
                  />
                </div>
              </>
            )}
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as AttendanceStatus })}
                className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
              >
                <option value="">全部</option>
                {Object.entries(statusMap).map(([key, value]) => (
                  <option key={key} value={key}>{value.text}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2 lg:col-span-1">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                查询
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                重置
              </button>
            </div>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 h-[48px]">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">工号</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">姓名</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">部门</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">日期</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">班次</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">签到时间</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">签退时间</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">状态</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">异常时长(分)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic">
                      <span className="material-icons text-4xl block mb-2 mx-auto text-gray-300">folder_open</span>
                      No records found
                    </td>
                  </tr>
                ) : (
                  data.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors h-[56px]">
                      <td className="px-6 py-4 text-sm text-gray-700">{record.employeeNo}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.employeeName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.deptName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.workDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.shiftName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.checkInTime ? dayjs(record.checkInTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.checkOutTime ? dayjs(record.checkOutTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusMap[record.status]?.bgColor || 'bg-gray-100'
                        } ${
                          statusMap[record.status]?.color || 'text-gray-800'
                        }`}>
                          {statusMap[record.status]?.text || record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {renderAbnormal(record)}
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
                onClick={() => fetchRecords(Math.max(1, filters.page - 1), filters.pageSize)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchRecords(filters.page + 1, filters.pageSize)}
                disabled={filters.page * filters.pageSize >= total}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(filters.page - 1) * filters.pageSize + 1}</span> to <span className="font-medium">{Math.min(filters.page * filters.pageSize, total)}</span> of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => fetchRecords(Math.max(1, filters.page - 1), filters.pageSize)}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>
                  <button
                    onClick={() => fetchRecords(filters.page + 1, filters.pageSize)}
                    disabled={filters.page * filters.pageSize >= total}
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

        <StandardModal
          isOpen={recalcModalVisible}
          onClose={() => setRecalcModalVisible(false)}
          title="手动重算考勤"
          footer={recalcFooter}
          width="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={recalcForm.startDate}
                onChange={(e) => setRecalcForm({ ...recalcForm, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={recalcForm.endDate}
                onChange={(e) => setRecalcForm({ ...recalcForm, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                员工ID列表 (可选)
              </label>
              <input
                type="text"
                placeholder="例如: 1, 2, 3"
                value={recalcForm.employeeIds}
                onChange={(e) => setRecalcForm({ ...recalcForm, employeeIds: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
              />
              <p className="mt-1 text-xs text-gray-500">多个ID用逗号分隔，不填则重算所有员工</p>
            </div>
          </div>
        </StandardModal>
      </div>
    </div>
  );
};

export default DailyRecords;
