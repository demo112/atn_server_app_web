import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/common/ToastProvider';
import dayjs from 'dayjs';
import { getClockRecords, manualClock } from '../../../services/clock';
import { userService } from '../../../services/user';
import type { ClockRecord, ClockType, UserListVo } from '@attendance/shared';
import { logger } from '../../../utils/logger';
import StandardModal from '@/components/common/StandardModal';
import PunchFilter from './components/PunchFilter';
import PunchTable from './components/PunchTable';
import Pagination from './components/Pagination';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_FILTER = {
  startTime: dayjs().startOf('day').format('YYYY-MM-DDTHH:mm'),
  endTime: dayjs().endOf('day').format('YYYY-MM-DDTHH:mm'),
  employeeId: '' as string | number,
};

const ClockRecordPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClockRecord[]>([]);
  const [total, setTotal] = useState(0);

  // Query Params (Trigger Fetch)
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    ...DEFAULT_FILTER,
  });

  // Filter Input State (No Trigger)
  const [filterParams, setFilterParams] = useState({
    ...DEFAULT_FILTER,
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
        page: queryParams.page,
        pageSize: queryParams.pageSize,
        startTime: dayjs(queryParams.startTime).toISOString(),
        endTime: dayjs(queryParams.endTime).toISOString(),
      };
      if (queryParams.employeeId) {
        apiParams.employeeId = Number(queryParams.employeeId);
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
  }, [queryParams]);

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
  }, [fetchData]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = () => {
    setQueryParams(prev => ({
      ...prev,
      ...filterParams,
      page: 1, // Reset to first page on search
    }));
  };

  const handleReset = () => {
    setFilterParams({ ...DEFAULT_FILTER });
    setQueryParams({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      ...DEFAULT_FILTER,
    });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setQueryParams(prev => ({
      ...prev,
      page,
      pageSize,
    }));
  };

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
    <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">原始考勤记录</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95"
        >
          <span className="material-icons mr-2 text-sm">add</span>
          补录打卡
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col flex-1 min-h-0">
        <PunchFilter
          params={filterParams}
          setParams={setFilterParams}
          onSearch={handleSearch}
          onReset={handleReset}
          users={users}
        />
        
        <div className="flex-1 overflow-hidden relative">
          <PunchTable data={data} loading={loading} />
        </div>

        <Pagination
          current={queryParams.page}
          pageSize={queryParams.pageSize}
          total={total}
          onChange={handlePageChange}
        />
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
  );
};

export default ClockRecordPage;
