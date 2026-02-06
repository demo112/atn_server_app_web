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
import StandardModal from '../../components/common/StandardModal';
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
  const [recalcModalVisible, setRecalcModalVisible] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
  const [recalcForm, setRecalcForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeIds: '',
  });

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

  const handleRecalculate = async () => {
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
            
            // Auto refresh if current month is in range
            const [year, month] = currentMonth.split('-');
            const yearNum = parseInt(year);
            const monthNum = parseInt(month);
            const end = new Date(yearNum, monthNum, 0);
            const currentMonthStart = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
            const currentMonthEnd = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
            
            if (
              (recalcForm.startDate >= currentMonthStart && recalcForm.startDate <= currentMonthEnd) ||
              (recalcForm.endDate >= currentMonthStart && recalcForm.endDate <= currentMonthEnd) ||
              (recalcForm.startDate <= currentMonthStart && recalcForm.endDate >= currentMonthEnd)
            ) {
              fetchData();
            }
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

  const recalcFooter = (
    <div className="flex justify-end gap-3 mt-6">
      <button
        onClick={() => setRecalcModalVisible(false)}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        取消
      </button>
      <button
        onClick={handleRecalculate}
        disabled={recalcLoading}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {recalcLoading ? '计算中...' : '开始重算'}
      </button>
    </div>
  );

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

      <div className="p-6 bg-white m-4 rounded-xl shadow-md border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end border-b border-slate-100 pb-8 mb-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">统计月份</label>
            <div className="flex items-center border border-slate-300 rounded-lg px-4 py-2.5 bg-white focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
              <input 
                type="month" 
                className="bg-transparent border-none p-0 text-sm w-full focus:ring-0 font-medium" 
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">查询范围</label>
            <div className="flex border border-slate-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 shadow-sm transition-all">
              <select 
                className="text-sm border-none bg-slate-50 focus:ring-0 border-r border-slate-300 w-36 py-2.5 font-medium"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
              >
                <option value="dept">按部门</option>
                <option value="emp">按人员</option>
              </select>
              <input 
                type="text" 
                placeholder="输入搜索词..." 
                className="flex-1 text-sm border-none focus:ring-0 py-2.5 px-4"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="flex-1 bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-md text-sm active:scale-95">查询</button>
            <button className="flex-1 border border-slate-300 px-8 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition text-sm text-slate-600 active:scale-95">重置</button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 border border-slate-300 px-6 py-2.5 rounded-xl text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition group shadow-sm bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons-outlined text-xl text-slate-500 group-hover:text-blue-600">{isExporting ? 'hourglass_top' : 'download'}</span> 
            {isExporting ? '导出中...' : '导出数据'}
          </button>
          <button 
            onClick={() => setRecalcModalVisible(true)}
            className="flex items-center gap-2 border border-slate-300 px-6 py-2.5 rounded-xl text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition group shadow-sm bg-white text-slate-700"
          >
            <span className="material-icons-outlined text-xl text-slate-500 group-hover:text-blue-600 group-hover:rotate-180 transition-transform duration-700">refresh</span> 考勤计算
            <span className="material-icons-outlined text-sm text-slate-300 ml-1">help_outline</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
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

        <div className="mt-8 flex items-center justify-end gap-5 text-[11px] font-bold text-slate-400">
          <span>共 {data.length} 条数据</span>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm items-center">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-50 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span className="material-icons-outlined text-sm">chevron_left</span>
            </button>
            <span className="px-4 py-1.5 bg-white text-slate-700 font-bold border-x border-slate-100">
              {page} / {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span className="material-icons-outlined text-sm">chevron_right</span>
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
            
            <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
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
              max={recalcForm.endDate}
              onChange={(e) => setRecalcForm({ ...recalcForm, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={recalcForm.endDate}
              min={recalcForm.startDate}
              onChange={(e) => setRecalcForm({ ...recalcForm, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-shadow"
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
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-shadow"
            />
            <p className="mt-1 text-xs text-gray-500">多个ID用逗号分隔，不填则重算所有员工</p>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

export default MonthlyCardReport;
