import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyRecords, exportStats } from '../../services/statistics';
import { DailyRecordVo, AttendanceStatus } from '@attendance/shared';

const DailyStatsReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DailyRecordVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [queryDate, setQueryDate] = useState(new Date().toISOString().split('T')[0]);
  const [keyword, setKeyword] = useState('');
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Default to query single day
      const res = await getDailyRecords({
        startDate: queryDate,
        endDate: queryDate,
        employeeName: keyword || undefined,
        page: 1,
        pageSize: 100 // Fetch more for report
      });
      setData(res.items);
    } catch (err) {
      console.error('Failed to fetch daily records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Initial load

  const handleSearch = () => {
    fetchData();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportStats({
        type: 'daily',
        startDate: queryDate,
        endDate: queryDate,
        employeeName: keyword || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-stats-${queryDate}.xlsx`;
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

  // Helper to map status to Chinese and style
  const getStatusInfo = (status: AttendanceStatus) => {
    const map: Record<string, { label: string; style: string }> = {
      'normal': { label: '正常', style: 'bg-green-100 text-green-700' },
      'late': { label: '迟到', style: 'bg-red-100 text-red-700' },
      'early_leave': { label: '早退', style: 'bg-orange-100 text-orange-700' },
      'absent': { label: '缺勤', style: 'bg-red-100 text-red-700' },
      'leave': { label: '请假', style: 'bg-blue-100 text-blue-700' },
      'business_trip': { label: '出差', style: 'bg-indigo-100 text-indigo-700' },
    };
    return map[status] || { label: status, style: 'bg-slate-100 text-slate-500' };
  };

  // Helper to format time (HH:mm:ss)
  const formatTime = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      return new Date(isoString).toLocaleTimeString('zh-CN', { hour12: false });
    } catch {
      return '--';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center text-slate-500 mb-6 cursor-pointer hover:text-blue-600 w-fit" onClick={() => navigate('/statistics/dashboard')}>
        <span className="material-icons-outlined mr-2">chevron_left</span>
        <span className="text-sm font-medium">返回统计报表</span>
      </div>

      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">每日统计全字段报表</h2>
            <p className="text-slate-500 mt-1">查看和管理员工的每日出勤详细数据。</p>
          </div>
        </div>

        {/* 优化后的查询栏：保留日期和统一的范围查询 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">查询日期</label>
            <input 
              type="date" 
              className="text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5" 
              value={queryDate}
              onChange={(e) => setQueryDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">查询范围</label>
            <div className="flex border border-slate-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <select className="text-sm border-none bg-slate-50 focus:ring-0 border-r border-slate-200 w-36 py-2.5">
                <option value="name">按姓名</option>
              </select>
              <input 
                type="text" 
                placeholder="输入员工姓名..." 
                className="flex-1 text-sm border-none focus:ring-0 py-2.5 px-4"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSearch}
              className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm active:scale-95"
            >
              查询
            </button>
            <button 
              onClick={() => {
                setQueryDate(new Date().toISOString().split('T')[0]);
                setKeyword('');
                // Reset triggers fetch via handleSearch call or just set state and let user click
                // For better UX, trigger fetch after reset? Or just reset fields.
                // Let's just reset fields for now.
              }}
              className="flex-1 bg-white border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition active:scale-95"
            >
              重置
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button 
               onClick={handleExport}
               disabled={isExporting}
               className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <span className="material-icons-outlined text-xl">{isExporting ? 'hourglass_top' : 'download'}</span> 
               {isExporting ? '导出中...' : '导出数据'}
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 transition group shadow-sm">
               <span className="material-icons-outlined text-xl group-hover:rotate-180 transition-transform duration-700">refresh</span> 考勤计算
               <span className="material-icons-outlined text-slate-300 text-base">help_outline</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden flex flex-col">
        <div className="overflow-x-auto relative w-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[2600px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th rowSpan={2} className="sticky left-0 z-20 bg-slate-50 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px] border-r border-slate-200">姓名</th>
                <th rowSpan={2} className="sticky left-[150px] z-20 bg-slate-50 px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[150px] border-r border-slate-200 shadow-sm">部门</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">工号</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">工作日期</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">考勤组</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">班次</th>
                <th colSpan={2} className="px-6 py-3 text-xs font-bold text-blue-600 bg-blue-50/30 border-l-2 border-l-blue-200 text-center">第1次上下班</th>
                <th colSpan={2} className="px-6 py-3 text-xs font-bold text-blue-600 bg-blue-50/30 text-center">第2次上下班</th>
                <th colSpan={2} className="px-6 py-3 text-xs font-bold text-indigo-600 bg-indigo-50/30 border-l-2 border-l-indigo-200 text-center">第3次上下班</th>
                <th colSpan={2} className="px-6 py-3 text-xs font-bold text-indigo-600 bg-indigo-50/30 text-center">第4次上下班</th>
                <th colSpan={2} className="px-6 py-3 text-xs font-bold text-purple-600 bg-purple-50/30 border-l-2 border-l-purple-200 text-center">第5次上下班</th>
                <th colSpan={2} className="px-6 py-3 text-xs font-bold text-purple-600 bg-purple-50/30 text-center">第6次上下班</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-l-2 border-l-slate-200">应出勤工时</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">实际出勤工时</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">迟到 (分)</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">早退 (分)</th>
                <th rowSpan={2} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">缺勤 (分)</th>
              </tr>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-4 py-2 text-[10px] text-slate-400 border-l-2 border-l-blue-100">打卡时间</th><th className="px-4 py-2 text-[10px] text-slate-400">结果</th>
                <th className="px-4 py-2 text-[10px] text-slate-400">打卡时间</th><th className="px-4 py-2 text-[10px] text-slate-400">结果</th>
                <th className="px-4 py-2 text-[10px] text-slate-400 border-l-2 border-l-indigo-100">打卡时间</th><th className="px-4 py-2 text-[10px] text-slate-400">结果</th>
                <th className="px-4 py-2 text-[10px] text-slate-400">打卡时间</th><th className="px-4 py-2 text-[10px] text-slate-400">结果</th>
                <th className="px-4 py-2 text-[10px] text-slate-400 border-l-2 border-l-purple-100">打卡时间</th><th className="px-4 py-2 text-[10px] text-slate-400">结果</th>
                <th className="px-4 py-2 text-[10px] text-slate-400">打卡时间</th><th className="px-4 py-2 text-[10px] text-slate-400">结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={23} className="px-6 py-10 text-center text-slate-500">加载中...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={23} className="px-6 py-10 text-center text-slate-500">暂无数据</td>
                </tr>
              ) : (
                data.map((row) => {
                  const statusInfo = getStatusInfo(row.status);
                  // Construct shifts display
                  // Slot 1: checkInTime
                  // Slot 2: checkOutTime
                  // Others: --
                  const checkInDisplay = row.checkInTime ? formatTime(row.checkInTime) : '--';
                  const checkOutDisplay = row.checkOutTime ? formatTime(row.checkOutTime) : '--';
                  
                  return (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/30 px-6 py-4 text-sm font-semibold text-slate-900 border-r border-slate-200">{row.employeeName}</td>
                      <td className="sticky left-[150px] z-10 bg-white group-hover:bg-blue-50/30 px-6 py-4 text-sm text-slate-500 border-r border-slate-200 shadow-sm">{row.deptName}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{row.employeeNo}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{row.workDate}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{'--'}</td> {/* Attendance Group not in VO */}
                      <td className="px-6 py-4 text-sm text-slate-500">{row.shiftName || '--'}</td>
                      
                      {/* 1st Shift: Check In */}
                      <td className="px-4 py-4 text-sm border-l-2 border-slate-100 text-slate-800">{checkInDisplay}</td>
                      <td className="px-4 py-4 text-sm"><StatusBadge status={row.status} label={statusInfo.label} style={statusInfo.style} /></td>
                      
                      {/* 1st Shift: Check Out */}
                      <td className="px-4 py-4 text-sm border-l-2 border-slate-100 text-slate-800">{checkOutDisplay}</td>
                      <td className="px-4 py-4 text-sm"><StatusBadge status={row.status} label={statusInfo.label} style={statusInfo.style} /></td>

                      {/* 2nd Shift (Empty for now) */}
                      <td className="px-4 py-4 text-sm border-l-2 border-slate-100 text-slate-800">--</td>
                      <td className="px-4 py-4 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">不需打卡</span></td>
                      <td className="px-4 py-4 text-sm border-l-2 border-slate-100 text-slate-800">--</td>
                      <td className="px-4 py-4 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">不需打卡</span></td>

                      {/* 3rd Shift (Empty for now) */}
                      <td className="px-4 py-4 text-sm border-l-2 border-slate-100 text-slate-800">--</td>
                      <td className="px-4 py-4 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">不需打卡</span></td>
                      <td className="px-4 py-4 text-sm border-l-2 border-slate-100 text-slate-800">--</td>
                      <td className="px-4 py-4 text-sm"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">不需打卡</span></td>
                      
                      <td className="px-6 py-4 text-sm font-bold border-l-2 border-slate-100">--</td> {/* Scheduled Hours */}
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{(row.lateMinutes + row.earlyLeaveMinutes + row.absentMinutes + row.leaveMinutes) > 0 ? '异常' : '正常'}</td> {/* Actual Hours simplified */}
                      <td className={`px-6 py-4 text-sm ${row.lateMinutes > 0 ? 'text-red-600 font-black' : 'text-slate-500'}`}>{row.lateMinutes}</td>
                      <td className={`px-6 py-4 text-sm ${row.earlyLeaveMinutes > 0 ? 'text-orange-600 font-black' : 'text-slate-500'}`}>{row.earlyLeaveMinutes}</td>
                      <td className={`px-6 py-4 text-sm ${row.absentMinutes > 0 ? 'text-red-600 font-black' : 'text-slate-500'}`}>{row.absentMinutes}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            共 <span className="font-bold text-slate-700">{total}</span> 条记录
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span className="material-icons-outlined text-sm">chevron_left</span>
            </button>
            <span className="text-sm font-medium text-slate-600">
              第 {page} 页 / 共 {Math.ceil(total / pageSize) || 1} 页
            </span>
            <button 
              onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize) || 1, p + 1))}
              disabled={page >= (Math.ceil(total / pageSize) || 1) || loading}
              className="p-2 border border-slate-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span className="material-icons-outlined text-sm">chevron_right</span>
            </button>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 text-sm border-slate-300 rounded focus:ring-blue-500 py-1.5"
            >
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string; label: string; style: string }> = ({ status, label, style }) => {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${style}`}>
      {label}
    </span>
  );
};

export default DailyStatsReport;
