import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import * as correctionService from '../../../services/correction';
import { DepartmentTree } from '@/components/common/DepartmentTree';
import { useToast } from '@/components/common/ToastProvider';
import { CheckInDialog } from './components/CheckInDialog';
import { CheckOutDialog } from './components/CheckOutDialog';
import type { CorrectionDailyRecordVo as DailyRecordVo, AttendanceStatus, AttendanceRecord } from '@attendance/shared';

// 状态映射（保持与 reference 一致的样式逻辑）
const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    '缺勤': 'text-red-500 bg-red-50',
    '正常': 'text-green-500 bg-green-50',
    '迟到': 'text-orange-500 bg-orange-50',
    '早退': 'text-orange-500 bg-orange-50',
    'default': 'text-slate-500 bg-slate-50'
  };
  // 简单映射后端状态到前端显示文本
  const statusTextMap: Record<string, string> = {
    'normal': '正常',
    'late': '迟到',
    'early_leave': '早退',
    'absent': '缺勤',
    'leave': '请假',
    'business_trip': '出差'
  };
  
  const text = statusTextMap[status] || status;
  const className = styles[text] || styles['default'];
  return { text, className };
};

const CorrectionProcessingPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyRecordVo[]>([]);
  const [total, setTotal] = useState(0);
  
  // Modal State
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DailyRecordVo | null>(null);

  // Filter State
  const [params, setParams] = useState({
    page: 1,
    pageSize: 20,
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    deptId: undefined as number | undefined,
    keyword: '',
    status: '' as AttendanceStatus | '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await correctionService.getDailyRecords({
        page: params.page,
        pageSize: params.pageSize,
        startDate: params.startDate,
        endDate: params.endDate,
        deptId: params.deptId,
        employeeName: params.keyword, // API参数映射
        status: params.status || undefined,
      });
      setData(res.items || []);
      setTotal(res.total);
    } catch (error) {
      toast.error('获取考勤数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [params, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = () => {
    setParams(prev => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setParams({
      page: 1,
      pageSize: 20,
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      deptId: undefined,
      keyword: '',
      status: '',
    });
  };

  const openCheckIn = (record: DailyRecordVo) => {
    setSelectedRecord(record);
    setCheckInOpen(true);
  };

  const openCheckOut = (record: DailyRecordVo) => {
    setSelectedRecord(record);
    setCheckOutOpen(true);
  };

  const handleSuccess = () => {
    toast.success('补签申请提交成功');
    fetchData();
  };

  const totalPages = Math.ceil(total / params.pageSize);

  return (
    <div className="flex h-full bg-slate-50">
      {/* Sidebar (DepartmentTree) */}
      <div className="w-[240px] shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 font-medium text-slate-700">
          部门筛选
        </div>
        <div className="flex-1 overflow-auto p-2">
          <DepartmentTree onSelect={(id) => setParams(prev => ({ ...prev, deptId: id, page: 1 }))} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Filters Header - Cloning incoming/web/signed/App.tsx structure */}
        <div className="bg-white px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-3">
              <span className="text-slate-500">起止时间</span>
              <div className="flex items-center space-x-2">
                <input 
                  type="date" 
                  value={params.startDate}
                  onChange={(e) => setParams({ ...params, startDate: e.target.value })}
                  className="border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="date" 
                  value={params.endDate}
                  onChange={(e) => setParams({ ...params, endDate: e.target.value })}
                  className="border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
               <span className="text-slate-500">状态</span>
               <select
                  value={params.status}
                  onChange={(e) => setParams({ ...params, status: e.target.value as AttendanceStatus })}
                  className="border border-slate-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
               >
                 <option value="">全部</option>
                 <option value="normal">正常</option>
                 <option value="late">迟到</option>
                 <option value="early_leave">早退</option>
                 <option value="absent">缺勤</option>
               </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
          <div className="relative group">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-primary">search</span>
            <input 
              type="text" 
              placeholder="姓名/工号" 
              className="pl-9 pr-4 py-1.5 border-slate-300 rounded text-sm w-48 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
              value={params.keyword}
              onChange={(e) => setParams({ ...params, keyword: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded text-sm font-medium flex items-center transition-all shadow-sm"
          >
            查询
          </button>
          <button 
            onClick={handleReset}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-1.5 rounded text-sm font-medium flex items-center transition-all shadow-sm"
          >
            重置
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">部门</th>
                <th className="px-4 py-3 font-medium">工号</th>
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium text-center">班次名称</th>
                <th className="px-4 py-3 font-medium text-center">上下班时间段</th>
                <th className="px-4 py-3 font-medium text-center">签到时间</th>
                <th className="px-4 py-3 font-medium text-center">签退时间</th>
                <th className="px-4 py-3 font-medium text-center">考勤状态</th>
                <th className="px-4 py-3 font-medium text-center">缺勤时长(分)</th>
                <th className="px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-500">加载中...</td></tr>
              ) : data.length === 0 ? (
                 <tr><td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    <span className="material-icons text-4xl block mb-2 text-slate-300">inventory_2</span>
                    暂无数据
                 </td></tr>
              ) : (
                data.map((row) => {
                  const statusInfo = getStatusStyle(row.status);
                  // 补签到逻辑: 缺卡(无签到时间) 或 迟到
                  const canCheckIn = !row.checkInTime || row.status === 'late' || row.status === 'absent';
                  // 补签退逻辑: 缺卡(无签退时间) 或 早退
                  const canCheckOut = !row.checkOutTime || row.status === 'early_leave' || row.status === 'absent';

                  return (
                    <tr key={row.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.workDate}</td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.deptName}</td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.employeeId}</td>
                      <td className="px-4 py-3.5 text-slate-900 font-medium whitespace-nowrap">{row.employeeName}</td>
                      <td className="px-4 py-3.5 text-slate-600 text-center whitespace-nowrap">{row.shiftName}</td>
                      <td className="px-4 py-3.5 text-slate-600 text-center whitespace-nowrap">{row.startTime} - {row.endTime}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-center italic">{row.checkInTime ? dayjs(row.checkInTime).format('HH:mm:ss') : '(~)'}</td>
                      <td className="px-4 py-3.5 text-slate-400 text-center italic">{row.checkOutTime ? dayjs(row.checkOutTime).format('HH:mm:ss') : '(~)'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-center">{row.absentMinutes || 0}</td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2 text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                          {canCheckIn && (
                            <button 
                              className="p-1 hover:bg-primary/10 rounded-md transition-all" 
                              title="补签到"
                              onClick={() => openCheckIn(row)}
                            >
                              <span className="material-icons text-xl">event_available</span>
                            </button>
                          )}
                          {canCheckOut && (
                            <button 
                              className="p-1 hover:bg-primary/10 rounded-md transition-all" 
                              title="补签退"
                              onClick={() => openCheckOut(row)}
                            >
                              <span className="material-icons text-xl">logout</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-end space-x-4 text-sm text-slate-600 shrink-0">
        <span>共 {total} 条</span>
        <div className="flex items-center space-x-1">
          <button 
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-30"
            disabled={params.page === 1}
            onClick={() => setParams(p => ({ ...p, page: p.page - 1 }))}
          >
            <span className="material-icons text-base">chevron_left</span>
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center border border-primary bg-blue-50 text-primary font-semibold rounded">
            {params.page}
          </button>
          
          <button 
            className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-30"
            disabled={params.page >= totalPages}
            onClick={() => setParams(p => ({ ...p, page: p.page + 1 }))}
          >
            <span className="material-icons text-base">chevron_right</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            className="border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            value={params.pageSize}
            onChange={(e) => setParams(p => ({ ...p, pageSize: Number(e.target.value), page: 1 }))}
          >
            <option value="20">20条/页</option>
            <option value="50">50条/页</option>
            <option value="100">100条/页</option>
          </select>
        </div>
      </footer>

      {/* Dialogs */}
      {selectedRecord && (
        <>
          <CheckInDialog
            isOpen={checkInOpen}
            onClose={() => setCheckInOpen(false)}
            onSuccess={handleSuccess}
            dailyRecordId={selectedRecord.id}
            employeeName={selectedRecord.employeeName}
            workDate={selectedRecord.workDate}
          />
          <CheckOutDialog
            isOpen={checkOutOpen}
            onClose={() => setCheckOutOpen(false)}
            onSuccess={handleSuccess}
            dailyRecordId={selectedRecord.id}
            employeeName={selectedRecord.employeeName}
            workDate={selectedRecord.workDate}
          />
        </>
      )}
      </div>
    </div>
  );
};

export default CorrectionProcessingPage;
