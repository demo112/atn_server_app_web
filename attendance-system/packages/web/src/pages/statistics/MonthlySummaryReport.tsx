import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartmentSummary, exportStats, triggerCalculation, getRecalculationStatus } from '../../services/statistics';
import { AttendanceSummaryVo, ExportStatsDto } from '@attendance/shared';
import { logger } from '../../utils/logger';
<<<<<<< HEAD
=======
// StandardModal removed
>>>>>>> a07a665 (style(statistics): 统一月度报表样式与尺寸)
import { useToast } from '@/components/common/ToastProvider';

const MonthlySummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // Generate Days 1-31 columns
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [data, setData] = useState<AttendanceSummaryVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<'dept' | 'emp' | 'group'>('emp');

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Recalculation State
  const [recalcLoading, setRecalcLoading] = useState(false);

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

      toast.info('正在请求重新计算...', { duration: 2000 });

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
      logger.error('Recalculation failed', error);
      toast.error('重算请求失败');
      setRecalcLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [year, month] = currentMonth.split('-');
      // Construct date range for the full month
      // Note: new Date(y, m-1, 1) is start, new Date(y, m, 0) is end
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      const end = new Date(yearNum, monthNum, 0);

      // Use local date string YYYY-MM-DD
      const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const res = await getDepartmentSummary({
        startDate,
        endDate,
        employeeName: searchType === 'emp' ? (keyword || undefined) : undefined,
        deptName: searchType === 'dept' ? (keyword || undefined) : undefined,
      });
      setData(res);
      setPage(1); // Reset page
    } catch (err) {
      logger.error('Failed to fetch monthly summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // 准备导出参数
      const params: ExportStatsDto & { employeeName?: string, deptName?: string } = {
        month: currentMonth,
        employeeName: searchType === 'emp' ? (keyword || undefined) : undefined,
        deptName: searchType === 'dept' ? (keyword || undefined) : undefined,
      };
      
      const blob = await exportStats(params);
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `考勤月度汇总-${currentMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      logger.error('Failed to export stats:', err);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const displayedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center text-sm">
        <span className="material-icons-outlined text-slate-400 mr-2 text-lg cursor-pointer hover:text-blue-600" onClick={() => navigate('/statistics/dashboard')}>chevron_left</span>
        <span className="font-semibold text-slate-800">月度汇总报表</span>
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
                <option value="group">按考勤组</option>
              </select>
              <input 
                type="text" 
                placeholder="输入名称、工号或部门" 
                className="flex-1 text-sm border-none focus:ring-0 py-2 px-4"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition shadow-sm font-bold text-sm active:scale-95"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? '查询中...' : '查询'}
            </button>
            <button className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 px-6 py-2 rounded-lg transition font-bold text-sm text-slate-600 active:scale-95">重置</button>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            disabled={exporting || data.length === 0}
            className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-blue-600 hover:text-blue-600 group transition shadow-sm text-sm font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <span className="material-icons-outlined text-xl animate-spin text-blue-600">sync</span>
            ) : (
              <span className="material-icons-outlined text-xl text-slate-500 group-hover:text-blue-600">download</span>
            )}
            <span>{exporting ? '导出中...' : '导出报表'}</span>
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
          <table className="min-w-[3000px] w-full text-sm text-center border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200 text-slate-700">
                <th colSpan={3} className="sticky left-0 bg-slate-50 px-4 py-3 border-r border-slate-200 shadow-sm z-30 font-bold">基本信息</th>
                <th colSpan={4} className="px-4 py-2 border-r border-slate-200 font-bold bg-blue-50/40 text-blue-700">概况</th>
                <th colSpan={8} className="px-4 py-2 border-r border-slate-200 font-bold bg-red-50/40 text-red-700">异常情况</th>
                <th colSpan={31} className="px-4 py-2 font-bold bg-indigo-50/40 text-indigo-700">每日统计</th>
              </tr>
              <tr className="border-b border-slate-200 text-[10px] text-slate-500 bg-slate-50/80">
                {/* 基本信息子项 */}
                <th className="sticky left-0 bg-slate-50 px-4 py-2 border-r border-slate-200 min-w-[120px] z-30 font-bold">姓名</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[120px]">部门</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[100px]">工号</th>
                {/* 概况 */}
                <th className="px-3 py-2 border-r border-slate-200 min-w-[80px]">应打卡(天)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[80px]">正常(天)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[90px]">应出勤(h)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[90px]">实际出勤(h)</th>
                {/* 异常情况 */}
                <th className="px-3 py-2 border-r border-slate-200 min-w-[60px]">迟到(次)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[70px]">迟到(m)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[60px]">早退(次)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[70px]">早退(m)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[60px]">旷工(次)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[60px]">旷工(m)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[60px]">缺卡(次)</th>
                <th className="px-3 py-2 border-r border-slate-200 min-w-[60px]">请假(次)</th>
                {/* 每日统计 1-31 */}
                {days.map(d => (
                  <th key={d} className="px-1 py-2 min-w-[30px] border-r border-slate-100 last:border-r-0 font-medium">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={44} className="py-10 text-slate-500">加载中...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={44} className="py-10 text-slate-500">暂无数据</td>
                </tr>
              ) : displayedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="sticky left-0 bg-white px-4 py-4 text-blue-600 font-bold border-r border-slate-200 shadow-sm z-20 group-hover:bg-blue-50/40">{row.employeeName}</td>
                  <td className="px-3 py-4 text-slate-600 border-r border-slate-200 text-xs">{row.deptName}</td>
                  <td className="px-3 py-4 text-slate-500 border-r border-slate-200 font-mono text-xs">{row.employeeNo}</td>
                  
                  <td className="px-3 py-4 border-r border-slate-200">{row.totalDays}</td>
                  <td className="px-3 py-4 border-r border-slate-200 font-bold">{row.actualDays}</td>
                  <td className="px-3 py-4 border-r border-slate-200 font-mono">{row.totalDays * 8}</td>
                  <td className="px-3 py-4 border-r border-slate-200 font-mono text-blue-600 font-bold">{(row.actualMinutes / 60).toFixed(1)}</td>
                  
                  <td className={`px-3 py-4 border-r border-slate-200 ${row.lateCount > 0 ? 'text-red-600 font-bold' : ''}`}>{row.lateCount}</td>
                  <td className="px-3 py-4 border-r border-slate-200">{row.lateMinutes}</td>
                  <td className="px-3 py-4 border-r border-slate-200">{row.earlyLeaveCount}</td>
                  <td className="px-3 py-4 border-r border-slate-200">{row.earlyLeaveMinutes}</td>
                  <td className={`px-3 py-4 border-r border-slate-200 font-bold ${row.absentCount > 0 ? 'text-red-500' : ''}`}>{row.absentCount}</td>
                  <td className={`px-3 py-4 border-r border-slate-200 font-bold ${row.absentMinutes > 0 ? 'text-red-500' : ''}`}>{row.absentMinutes}</td>
                  <td className={`px-3 py-4 border-r border-slate-200 font-bold ${row.missingCount > 0 ? 'text-orange-500' : ''}`}>{row.missingCount}</td>
                  <td className={`px-3 py-4 border-r border-slate-200 font-bold ${row.leaveCount > 0 ? 'text-blue-500' : ''}`}>{row.leaveCount}</td>

                  {/* Daily symbols */}
                  {days.map((d, dIdx) => {
                    const status = row.daily?.[dIdx] || '-';
                    let statusClass = 'text-slate-400';
                    if (status === '√') statusClass = 'text-green-600 font-bold';
                    if (status === '迟') statusClass = 'text-red-500 font-bold';
                    if (status === '旷') statusClass = 'text-red-700 font-black';
                    if (status === '缺') statusClass = 'text-orange-500 font-bold';
                    if (status === '休') statusClass = 'text-slate-300';
                    return (
                      <td key={d} className={`px-1 py-4 border-r border-slate-50 last:border-r-0 text-[10px] ${statusClass}`}>
                        {status}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <span>共 {data.length} 条数据</span>
            <div className="flex items-center gap-3 ml-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600"></span>正常 (√)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>迟到 (迟)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>缺卡 (缺)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-700"></span>旷工 (旷)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition"
            >
              上一页
            </button>
            <span>{page} / {totalPages}</span>
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
              className="bg-transparent border-none text-xs focus:ring-0"
            >
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

export default MonthlySummaryReport;
