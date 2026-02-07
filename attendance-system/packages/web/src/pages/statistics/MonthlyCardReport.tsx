import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getDepartmentSummary, 
  getDailyRecords,
  exportStats,
  triggerCalculation,
  getRecalculationStatus
} from '../../services/statistics';
import { 
  AttendanceSummaryVo, 
  DailyRecordVo 
} from '@attendance/shared';
import { useToast } from '../../components/common/ToastProvider';

const MonthlyCardReport: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AttendanceSummaryVo | null>(null);
  const [modalData, setModalData] = useState<DailyRecordVo[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<AttendanceSummaryVo[]>([]);
  const [currentMonth, setCurrentMonth] = useState('2023-10');
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<'dept' | 'emp'>('emp');

  // Frontend pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Recalculation Modal State
  const [recalcLoading, setRecalcLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [year, month] = currentMonth.split('-');
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const end = new Date(yearNum, monthNum, 0);
      
      const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      
      const res = await getDepartmentSummary({ 
        startDate, 
        endDate,
        employeeName: searchType === 'emp' ? (keyword || undefined) : undefined,
        deptName: searchType === 'dept' ? (keyword || undefined) : undefined,
      });
      setData(res);
      setPage(1); // Reset page on new fetch
    } catch (err) {
      console.error('Failed to fetch monthly card data:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayedData = data.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(data.length / pageSize) || 1;

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportStats({
        type: 'summary',
        month: currentMonth,
        employeeName: searchType === 'emp' ? (keyword || undefined) : undefined,
        deptName: searchType === 'dept' ? (keyword || undefined) : undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly-card-${currentMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
      // Could show a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenDetails = async (user: AttendanceSummaryVo) => {
    setSelectedUser(user);
    setShowModal(true);
    setModalLoading(true);
    
    try {
      const [year, month] = currentMonth.split('-');
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const end = new Date(yearNum, monthNum, 0);
      
      const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const res = await getDailyRecords({
        startDate,
        endDate,
        employeeId: user.employeeId,
        page: 1,
        pageSize: 31
      });
      setModalData(res.items);
    } catch (err) {
      console.error('Failed to fetch user daily records:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDirectRecalculate = async () => {
    if (recalcLoading) return;
    
    setRecalcLoading(true);
    try {
      const [year, month] = currentMonth.split('-');
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const end = new Date(yearNum, monthNum, 0);
      const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
      
      let employeeName: string | undefined;
      let deptName: string | undefined;

      if (keyword) {
          if (searchType === 'emp') {
              employeeName = keyword;
          } else if (searchType === 'dept') {
              deptName = keyword;
          }
      }

      const params = {
        startDate,
        endDate,
        deptName,
        employeeName
      };

      toast.info('正在请求重新计算...');

      const batchId = await triggerCalculation(params);
      
      const poll = async () => {
        try {
          const status = await getRecalculationStatus(batchId);
          if (status.status === 'completed' || status.status === 'completed_with_errors') {
            setRecalcLoading(false);
            if (status.status === 'completed_with_errors') {
               toast.error(status.message || '重算完成，但有部分失败');
            } else {
               toast.success('重新计算完成');
            }
            
            // Auto refresh
            fetchData();
          } else if (status.status === 'failed') {
            setRecalcLoading(false);
            toast.error(status.message || '重算失败');
          } else {
            setTimeout(poll, 1000);
          }
        } catch (error) {
          console.error('Polling failed', error);
          toast.error('查询计算进度失败');
          setRecalcLoading(false);
        }
      };
      
      poll();
    } catch (error) {
      console.error('Recalculation failed', error);
      toast.error('重算请求失败');
      setRecalcLoading(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getWeekDay = (dateStr: string) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-blue-600 w-fit" onClick={() => navigate('/statistics/dashboard')}>
          <span className="material-icons-outlined text-lg">chevron_left</span>
          <span className="text-lg font-bold text-slate-800 uppercase tracking-wide">月度考勤卡表</span>
        </div>
      </div>

      <div className="m-4 p-5 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">统计月份</label>
            <div className="flex gap-2">
              <select 
                className="text-sm border border-slate-300 rounded-lg py-2 px-3 bg-white focus:ring-blue-500 focus:border-blue-500 flex-1"
                value={currentMonth.split('-')[0]}
                onChange={(e) => {
                  const newYear = e.target.value;
                  const month = currentMonth.split('-')[1];
                  setCurrentMonth(`${newYear}-${month}`);
                }}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                  <option key={year} value={year}>{year}年</option>
                ))}
              </select>
              <select 
                className="text-sm border border-slate-300 rounded-lg py-2 px-3 bg-white focus:ring-blue-500 focus:border-blue-500 flex-1"
                value={parseInt(currentMonth.split('-')[1])}
                onChange={(e) => {
                  const year = currentMonth.split('-')[0];
                  const newMonth = String(e.target.value).padStart(2, '0');
                  setCurrentMonth(`${year}-${newMonth}`);
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}月</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">查询范围</label>
            <div className="flex border border-slate-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 shadow-sm transition-all">
              <select 
                className="text-sm border-none bg-slate-50 focus:ring-0 border-r border-slate-300 w-28 py-2 font-medium"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
              >
                <option value="dept">按部门</option>
                <option value="emp">按人员</option>
              </select>
              <input 
                type="text" 
                placeholder="输入搜索词..." 
                className="flex-1 text-sm border-none focus:ring-0 py-2 px-4"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchData} 
              className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm text-sm active:scale-95"
              disabled={loading}
            >
              {loading ? '查询中...' : '查询'}
            </button>
            <button className="flex-1 bg-white border border-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-50 transition text-sm text-slate-600 active:scale-95">重置</button>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-blue-600 hover:text-blue-600 group transition shadow-sm text-sm font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons-outlined text-xl text-slate-500 group-hover:text-blue-600">{isExporting ? 'hourglass_top' : 'download'}</span> 
            <span>{isExporting ? '导出中...' : '导出数据'}</span>
          </button>
          <button 
            onClick={handleDirectRecalculate}
            disabled={recalcLoading}
            className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-blue-600 hover:text-blue-600 group transition shadow-sm text-sm font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`material-icons-outlined text-xl text-slate-500 group-hover:text-blue-600 ${recalcLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}>refresh</span>
            <span>{recalcLoading ? '计算中...' : '考勤计算'}</span>
            <span className="material-icons-outlined text-sm text-slate-300 ml-1">help_outline</span>
          </button>
        </div>
      </div>

      <div className="mx-4 flex-1 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col mb-4">
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200 text-slate-700">
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-left">姓名</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-left">部门</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-left">工号</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-left">考勤组</th>
                <th className="px-6 py-4 font-black uppercase text-xs tracking-widest text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={5} className="text-center py-10 text-slate-500">加载中...</td></tr>
              ) : data.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-10 text-slate-500">暂无数据</td></tr>
              ) : (
                displayedData.map((user, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-5 font-bold text-slate-900">{user.employeeName}</td>
                  <td className="px-6 py-5 text-slate-500 font-medium">{user.deptName}</td>
                  <td className="px-6 py-5 font-mono text-slate-500">{user.employeeNo}</td>
                  <td className="px-6 py-5 text-slate-500 font-medium">默认考勤组</td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleOpenDetails(user)}
                      className="text-blue-600 hover:scale-110 transition-transform p-2 rounded-lg hover:bg-blue-100"
                      title="查看月度卡片"
                    >
                      <span className="material-symbols-outlined font-bold">contact_page</span>
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <span>共 {data.length} 条数据</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition"
            >
              上一页
            </button>
            <span className="text-slate-700 font-bold">{page} / {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition"
            >
              下一页
            </button>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 text-xs border-none bg-transparent focus:ring-0 text-slate-500"
            >
              <option value="12">12条/页</option>
              <option value="24">24条/页</option>
              <option value="48">48条/页</option>
            </select>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-700 text-white p-4 flex items-center justify-between shadow-lg">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-icons-outlined">calendar_month</span>
                考勤卡表详细视图 - {selectedUser?.employeeName}
              </h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors flex items-center">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">汇总数据统计 (当月)</h4>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                  <table className="w-full text-xs border-collapse text-center">
                    <thead className="bg-slate-50 text-slate-500 font-black tracking-widest uppercase">
                      <tr>
                        <th className="border-b border-slate-200 p-3">旷工(次)</th>
                        <th className="border-b border-slate-200 p-3">缺勤(分)</th>
                        <th className="border-b border-slate-200 p-3">迟到(次/分)</th>
                        <th className="border-b border-slate-200 p-3">早退(次/分)</th>
                        <th className="border-b border-slate-200 p-3">应出勤(天)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold text-slate-700">
                        <td className={`p-4 font-black text-base ${selectedUser?.absentCount ? 'text-red-600 bg-red-50/20' : ''}`}>{selectedUser?.absentCount}</td>
                        <td className={`p-4 font-black text-base ${selectedUser?.absentMinutes ? 'text-orange-600' : ''}`}>{selectedUser?.absentMinutes}</td>
                        <td className="p-4">{selectedUser?.lateCount} / {selectedUser?.lateMinutes}m</td>
                        <td className="p-4 text-slate-400">{selectedUser?.earlyLeaveCount} / {selectedUser?.earlyLeaveMinutes}m</td>
                        <td className="p-4 text-blue-700 text-base">{selectedUser?.totalDays}天</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">日历详细考勤明细</h4>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                  <table className="w-full text-xs border-collapse text-center">
                    <thead className="bg-slate-50">
                      <tr className="text-slate-500 font-black uppercase tracking-widest">
                        <th className="border-b border-slate-200 p-3 min-w-[140px]">日期</th>
                        <th className="border-b border-slate-200 p-3">上班打卡</th>
                        <th className="border-b border-slate-200 p-3">下班打卡</th>
                        <th className="border-b border-slate-200 p-3">考勤结果</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {modalLoading ? (
                        <tr><td colSpan={4} className="p-4 text-slate-500">加载中...</td></tr>
                      ) : modalData.length === 0 ? (
                        <tr><td colSpan={4} className="p-4 text-slate-500">暂无数据</td></tr>
                      ) : (
                        modalData.map((record, idx) => (
                          <tr key={idx}>
                            <td className="p-4 font-bold text-slate-800">{record.workDate} ({getWeekDay(record.workDate)})</td>
                            <td className="p-4 font-black text-blue-600">{formatTime(record.checkInTime)}</td>
                            <td className="p-4 font-black text-blue-600">{formatTime(record.checkOutTime)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${
                                record.status === 'normal' ? 'bg-green-100 text-green-700' :
                                record.status === 'late' || record.status === 'early_leave' || record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-400'
                              }`}>
                                {record.status === 'normal' ? '正常' : 
                                 record.status === 'late' ? '迟到' :
                                 record.status === 'early_leave' ? '早退' :
                                 record.status === 'absent' ? '旷工' : 
                                record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCardReport;
