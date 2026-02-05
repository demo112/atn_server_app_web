import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { getDepartmentSummary, triggerCalculation, getRecalculationStatus } from '../../services/statistics';
import { AttendanceSummaryVo, GetSummaryDto } from '@attendance/shared';
import { DepartmentSelect } from '../../components/DepartmentSelect';
import { useToast } from '@/components/common/ToastProvider';

const SummaryPage: React.FC = (): React.ReactElement => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceSummaryVo[]>([]);
  
  // Form State
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [deptId, setDeptId] = useState<number | undefined>(undefined);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      if (!startDate || !endDate) {
          toast.error('请选择日期范围');
          return;
      }

      const params: GetSummaryDto = {
        startDate,
        endDate,
        deptId,
      };

      const res = await getDepartmentSummary(params);
      setData(res || []);
    } catch (error) {
      toast.error('查询失败');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, deptId, toast]);

  const handleRecalculate = async (): Promise<void> => {
    try {
      if (!startDate || !endDate) {
          toast.error('请选择日期范围');
          return;
      }

      setLoading(true);
      const batchId = await triggerCalculation({
        startDate,
        endDate,
      });
      
      const poll = async () => {
        try {
          const status = await getRecalculationStatus(batchId);
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
      console.error('Recalculation failed', error);
      toast.error('触发计算失败');
      setLoading(false);
    }
  };

  const handleExport = (): void => {
    if (data.length === 0) {
      toast.warning('暂无数据可导出');
      return;
    }

    const exportData = data.map(item => ({
      '工号': item.employeeNo,
      '姓名': item.employeeName,
      '部门': item.deptName,
      '应出勤天数': item.totalDays,
      '实际出勤天数': item.actualDays,
      '迟到次数': item.lateCount,
      '迟到时长(分)': item.lateMinutes,
      '早退次数': item.earlyLeaveCount,
      '早退时长(分)': item.earlyLeaveMinutes,
      '缺勤次数': item.absentCount,
      '缺勤时长(分)': item.absentMinutes,
      '请假次数': item.leaveCount,
      '请假时长(分)': item.leaveMinutes,
      '实际出勤时长': item.actualMinutes,
      '有效出勤时长': item.effectiveMinutes,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "考勤汇总");
    XLSX.writeFile(wb, `考勤汇总_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`);
  };

  useEffect(() => {
     fetchData();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header & Filter */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-medium text-gray-900">考勤汇总</h3>
            <div className="flex flex-wrap gap-4 items-end">
                {/* Date Range */}
                <div>
                    <div className="flex items-center gap-2">
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-36 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-[38px] border px-3"
                    />
                    <span className="text-gray-500">-</span>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-36 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-[38px] border px-3"
                    />
                    </div>
                </div>

                {/* Dept Select */}
                <div className="w-48">
                    <DepartmentSelect 
                    value={deptId}
                    onChange={(e) => setDeptId(Number(e.target.value) || undefined)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-[38px]"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
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
                        导出
                    </button>
                    <button
                        onClick={handleRecalculate}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                    >
                        <span className="material-icons text-sm mr-2">sync</span>
                        重新计算
                    </button>
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">工号</th>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">姓名</th>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">部门</th>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">应出勤(天)</th>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">实出勤(天)</th>
                <th colSpan={2} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-l border-r">迟到</th>
                <th colSpan={2} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r">早退</th>
                <th colSpan={2} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r">缺勤</th>
                <th colSpan={2} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r">请假</th>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">有效工时(分)</th>
              </tr>
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-l">次数</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r">时长</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">次数</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r">时长</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">次数</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r">时长</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">次数</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r">时长</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr>
                        <td colSpan={15} className="px-6 py-12 text-center text-gray-500">
                            加载中...
                        </td>
                    </tr>
                ) : data.length === 0 ? (
                    <tr>
                        <td colSpan={15} className="px-6 py-12 text-center text-gray-500">
                            暂无数据
                        </td>
                    </tr>
                ) : (
                    data.map((item) => (
                        <tr key={item.employeeId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.employeeNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.employeeName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.deptName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalDays}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.actualDays}</td>
                            
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center border-l border-gray-100">{item.lateCount || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center border-r border-gray-100">{item.lateMinutes || '-'}</td>
                            
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center">{item.earlyLeaveCount || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center border-r border-gray-100">{item.earlyLeaveMinutes || '-'}</td>
                            
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-red-500">{item.absentCount || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center border-r border-gray-100 text-red-500">{item.absentMinutes || '-'}</td>
                            
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center">{item.leaveCount || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center border-r border-gray-100">{item.leaveMinutes || '-'}</td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.effectiveMinutes}</td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
