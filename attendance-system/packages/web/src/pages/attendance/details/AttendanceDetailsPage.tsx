import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import * as correctionService from '../../../services/correction';
import { PersonnelSelectionModal, SelectionItem } from '@/components/common/PersonnelSelectionModal';
import type { CorrectionDailyRecordVo as DailyRecordVo, AttendanceStatus } from '@attendance/shared';
import { useToast } from '@/components/common/ToastProvider';

const statusMap: Record<AttendanceStatus, { text: string; color: string; bg: string }> = {
  normal: { text: '正常', color: 'text-green-800', bg: 'bg-green-100' },
  late: { text: '迟到', color: 'text-red-800', bg: 'bg-red-100' },
  early_leave: { text: '早退', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  absent: { text: '缺勤', color: 'text-gray-800', bg: 'bg-gray-100' },
  leave: { text: '请假', color: 'text-blue-800', bg: 'bg-blue-100' },
  business_trip: { text: '出差', color: 'text-purple-800', bg: 'bg-purple-100' },
};

const AttendanceDetailsPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  
  // Selection Modal State
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectionItem[]>([]);

  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    status: '' as AttendanceStatus | '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: any = {
        ...params,
        status: params.status || undefined,
      };

      if (selectedItems.length > 0) {
        const item = selectedItems[0];
        if (item.type === 'department') {
          queryParams.deptId = item.id;
        } else {
          queryParams.employeeId = item.id;
        }
      }

      const res = await correctionService.getDailyRecords(queryParams);
      setData(res.items || []);
      setTotal(res.total);
    } catch (error) {
      toast.error('获取考勤明细失败');
    } finally {
      setLoading(false);
    }
  }, [params, selectedItems, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ ...params, page: 1 });
  };

  const handleReset = () => {
    setParams({
      page: 1,
      pageSize: 10,
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      status: '',
    });
    setSelectedItems([]);
  };

  const handleRecalculate = async () => {
    if (!confirm('确定要重新计算当前日期范围内的考勤数据吗？')) return;
    
    try {
      setLoading(true);
      const batchId = await correctionService.triggerRecalculation({
        startDate: params.startDate,
        endDate: params.endDate,
      });
      
      const poll = async () => {
        try {
          const status = await correctionService.getRecalculationStatus(batchId);
          if (status.status === 'completed' || status.status === 'completed_with_errors') {
            setLoading(false);
            if (status.status === 'completed_with_errors') {
               toast.error(status.message || '重算完成，但有部分失败');
            } else {
               toast.success('重新计算完成');
            }
            fetchData();
          } else if (status.status === 'failed') {
            setLoading(false);
            toast.error(status.message || '重算失败');
          } else {
            setTimeout(poll, 1000);
          }
        } catch (error) {
          console.error('Polling failed', error);
          toast.error('查询计算进度失败');
          setLoading(false);
        }
      };
      
      poll();
    } catch (error) {
      toast.error('触发重算失败');
      setLoading(false);
    }
  };

  const formatMinutes = (minutes: number | undefined): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const totalPages = Math.ceil(total / params.pageSize);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">每日考勤明细</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleRecalculate}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <span className="material-icons text-sm mr-2">refresh</span>
            重新计算
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <span className="material-icons text-sm mr-2">download</span>
            导出
          </button>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <input
            type="date"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            value={params.startDate}
            onChange={(e) => setParams({ ...params, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <input
            type="date"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            value={params.endDate}
            onChange={(e) => setParams({ ...params, endDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">部门/人员</label>
          <div 
            onClick={() => setIsSelectionModalOpen(true)}
            className="relative cursor-pointer"
          >
            <input
              type="text"
              readOnly
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm cursor-pointer bg-white"
              placeholder="请选择部门或人员"
              value={selectedItems.map(i => i.name).join(', ')}
            />
            <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            value={params.status}
            onChange={(e) => setParams({ ...params, status: e.target.value as AttendanceStatus })}
          >
            <option value="">全部</option>
            {Object.entries(statusMap).map(([key, { text }]) => (
              <option key={key} value={key}>{text}</option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-5 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            重置
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            查询
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-[1000px] divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">部门</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">班次</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">规定时间</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">签到</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">签退</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出勤</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">缺勤</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">加载中...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">暂无数据</td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.workDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.deptName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.shiftName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.startTime} - {record.endTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkInTime ? dayjs(record.checkInTime).format('HH:mm:ss') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.checkOutTime ? dayjs(record.checkOutTime).format('HH:mm:ss') : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const config = statusMap[record.status] || { text: record.status, color: 'text-gray-800', bg: 'bg-gray-100' };
                      return (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.color}`}>
                          {config.text}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMinutes(record.workMinutes)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatMinutes(record.absentMinutes)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs" title={record.remark}>{record.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
            disabled={params.page === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            上一页
          </button>
          <button
            onClick={() => setParams({ ...params, page: Math.min(totalPages, params.page + 1) })}
            disabled={params.page >= totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
          >
            下一页
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              显示 <span className="font-medium">{(params.page - 1) * params.pageSize + 1}</span> 到 <span className="font-medium">{Math.min(params.page * params.pageSize, total)}</span> 条，
              共 <span className="font-medium">{total}</span> 条
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
                disabled={params.page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
              >
                <span className="sr-only">上一页</span>
                <span className="material-icons text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = params.page;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (params.page <= 3) {
                  pageNum = i + 1;
                } else if (params.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = params.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setParams({ ...params, page: pageNum })}
                    aria-current={params.page === pageNum ? 'page' : undefined}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      params.page === pageNum
                        ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setParams({ ...params, page: Math.min(totalPages, params.page + 1) })}
                disabled={params.page >= totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
              >
                <span className="sr-only">下一页</span>
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
      <PersonnelSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onConfirm={(items) => {
          setSelectedItems(items);
          setIsSelectionModalOpen(false);
        }}
        multiple={false}
        selectType="all"
        title="选择部门或人员"
        initialSelected={selectedItems}
      />
    </div>
  );
};

export default AttendanceDetailsPage;
