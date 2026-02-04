import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { getDeptStats, getChartStats, exportStats } from '@/services/statistics';
import { DeptStatsVo, ChartStatsVo } from '@attendance/shared';
import DeptStatsTable from './components/DeptStatsTable';
import AttendanceCharts from './components/AttendanceCharts';
import { useToast } from '@/components/common/ToastProvider';
import { DepartmentSelect } from '@/components/DepartmentSelect';

const ReportPage: React.FC = (): React.ReactElement => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [deptStats, setDeptStats] = useState<DeptStatsVo[]>([]);
  const [chartStats, setChartStats] = useState<ChartStatsVo>({ dailyTrend: [], statusDistribution: [] });

  // Form State
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [deptId, setDeptId] = useState<number | undefined>(undefined);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Fetch Dept Stats (Monthly)
      const deptRes = await getDeptStats({ month, deptId });
      setDeptStats(deptRes);

      // Fetch Chart Stats (Date Range)
      const chartRes = await getChartStats({ startDate, endDate, deptId });
      setChartStats(chartRes);

    } catch (error) {
      toast.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  }, [month, startDate, endDate, deptId, toast]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSearch = () => {
    fetchData();
  };

  const handleExport = async (): Promise<void> => {
    try {
      const response = await exportStats({ month, deptId });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_stats_${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('导出失败');
    }
  };

  return (
    <div className="p-6">
       {/* Filter Card */}
       <div className="bg-white rounded-lg shadow p-6 mb-6">
         <div className="flex flex-wrap gap-4 items-end">
           {/* Month Picker */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">统计月份</label>
             <input 
               type="month"
               value={month}
               onChange={(e) => setMonth(e.target.value)}
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-[38px] border px-3"
             />
           </div>
           
           {/* Date Range */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">图表日期范围</label>
             <div className="flex items-center gap-2">
               <input 
                 type="date"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-[38px] border px-3"
               />
               <span className="text-gray-500">-</span>
               <input 
                 type="date"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-[38px] border px-3"
               />
             </div>
           </div>

           {/* Department Select */}
           <div className="w-64">
             <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
             <DepartmentSelect 
               value={deptId}
               onChange={(e) => setDeptId(Number(e.target.value) || undefined)}
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-[38px]"
             />
           </div>

           {/* Buttons */}
           <div className="flex gap-2">
             <button
               onClick={handleSearch}
               disabled={loading}
               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
             >
               <span className="material-icons text-sm mr-2">search</span>
               查询
             </button>
             <button
               onClick={handleExport}
               className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
             >
               <span className="material-icons text-sm mr-2">download</span>
               导出报表
             </button>
           </div>
         </div>
       </div>

      <AttendanceCharts data={chartStats} loading={loading} />
      <DeptStatsTable data={deptStats} loading={loading} />
    </div>
  );
};

export default ReportPage;
