import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/common/ToastProvider';
import dayjs from 'dayjs';
import { getClockRecords, manualClock } from '../../../services/clock';
import { userService } from '../../../services/user';
import type { ClockRecord, ClockType, UserListVo } from '@attendance/shared';
import { logger } from '../../../utils/logger';
import StandardModal from '@/components/common/StandardModal';

const ClockRecordPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClockRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    startTime: dayjs().startOf('day').format('YYYY-MM-DDTHH:mm'),
    endTime: dayjs().endOf('day').format('YYYY-MM-DDTHH:mm'),
    employeeId: '' as string,
  });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<UserListVo['items']>([]);
  const [manualClockForm, setManualClockForm] = useState({
    employeeId: '',
    clockTime: '',
    type: 'sign_in' as ClockType,
  });

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const apiParams: any = {
        page: params.page,
        pageSize: params.pageSize,
        startTime: dayjs(params.startTime).toISOString(),
        endTime: dayjs(params.endTime).toISOString(),
      };
      if (params.employeeId) {
        apiParams.employeeId = Number(params.employeeId);
      }

      const res = await getClockRecords(apiParams);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      logger.error('Failed to fetch clock records', error);
      toast.error('获取考勤记录失败');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const loadUsers = useCallback(async (): Promise<void> => {
    try {
      const res = await userService.getUsers({ page: 1, pageSize: 100 });
      setUsers(res.items || []); 
    } catch (error) {
      logger.error('Failed to load users', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    loadUsers();
  }, [fetchData, loadUsers]);

  const handleManualClock = async (): Promise<void> => {
    try {
      if (!manualClockForm.employeeId || !manualClockForm.clockTime || !manualClockForm.type) {
        toast.error('请填写完整信息');
        return;
      }

      await manualClock({
        employeeId: Number(manualClockForm.employeeId),
        clockTime: dayjs(manualClockForm.clockTime).toISOString(),
        type: manualClockForm.type,
        source: 'web',
      });
      toast.success('补录成功');
      setIsModalOpen(false);
      setManualClockForm({
        employeeId: '',
        clockTime: '',
        type: 'sign_in',
      });
      fetchData();
    } catch (error) {
      logger.error('Manual clock failed', error);
      toast.error('补录失败');
    }
  };

  const manualClockFooter = (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={() => setIsModalOpen(false)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        取消
      </button>
      <button
        onClick={handleManualClock}
        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        确定
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">原始考勤记录</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="material-icons mr-2 text-sm">add</span>
              补录打卡
            </button>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="material-icons mr-2 text-sm">refresh</span>
              刷新
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">时间范围:</span>
            <input
              type="datetime-local"
              value={params.startTime}
              onChange={(e) => setParams({ ...params, startTime: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="datetime-local"
              value={params.endTime}
              onChange={(e) => setParams({ ...params, endTime: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">员工:</span>
            <select
              value={params.employeeId}
              onChange={(e) => setParams({ ...params, employeeId: e.target.value })}
              className="w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
            >
              <option value="">全部员工</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 h-[48px]">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">员工</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">来源</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">位置</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                      <span className="material-icons text-4xl block mb-2 mx-auto text-gray-300">folder_open</span>
                      No records found
                    </td>
                  </tr>
                ) : (
                  data.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors h-[56px]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {record.employeeName || record.employeeId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {dayjs(record.clockTime).format('YYYY-MM-DD HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.type === 'sign_in' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {record.type === 'sign_in' ? '上班' : '下班'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.source}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.location?.address || '-'}
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
                onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
                disabled={params.page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                disabled={params.page * params.pageSize >= total}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(params.page - 1) * params.pageSize + 1}</span> to <span className="font-medium">{Math.min(params.page * params.pageSize, total)}</span> of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
                    disabled={params.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setParams({ ...params, page: params.page + 1 })}
                    disabled={params.page * params.pageSize >= total}
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
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="补录打卡"
          footer={manualClockFooter}
          width="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                员工 <span className="text-red-500">*</span>
              </label>
              <select
                value={manualClockForm.employeeId}
                onChange={(e) => setManualClockForm({ ...manualClockForm, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
              >
                <option value="">选择员工</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                打卡时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={manualClockForm.clockTime}
                onChange={(e) => setManualClockForm({ ...manualClockForm, clockTime: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                类型 <span className="text-red-500">*</span>
              </label>
              <select
                value={manualClockForm.type}
                onChange={(e) => setManualClockForm({ ...manualClockForm, type: e.target.value as ClockType })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
              >
                <option value="sign_in">上班</option>
                <option value="sign_out">下班</option>
              </select>
            </div>
          </div>
        </StandardModal>
      </div>
    </div>
  );
};

export default ClockRecordPage;
