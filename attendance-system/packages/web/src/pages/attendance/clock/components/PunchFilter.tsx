import React from 'react';
import { UserListVo } from '@attendance/shared';

interface PunchFilterProps {
  params: {
    startTime: string;
    endTime: string;
    employeeId: string | number;
  };
  setParams: (params: any) => void;
  onSearch: () => void;
  onReset: () => void;
  users: UserListVo['items'];
}

const PunchFilter: React.FC<PunchFilterProps> = ({
  params,
  setParams,
  onSearch,
  onReset,
  users,
}) => {
  return (
    <section className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-end shadow-sm rounded-t-lg">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">时间范围</label>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <input
            className="px-3 py-1.5 text-sm bg-transparent border-none focus:ring-0 w-44 dark:text-gray-200 cursor-pointer"
            type="datetime-local"
            value={params.startTime}
            onChange={(e) => setParams({ ...params, startTime: e.target.value })}
          />
          <span className="px-2 text-gray-400 text-sm">至</span>
          <input
            className="px-3 py-1.5 text-sm bg-transparent border-none focus:ring-0 w-44 dark:text-gray-200 cursor-pointer"
            type="datetime-local"
            value={params.endTime}
            onChange={(e) => setParams({ ...params, endTime: e.target.value })}
          />
          <span className="material-symbols-outlined text-gray-400 text-sm pr-3">calendar_month</span>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">筛选部门</label>
        <div className="w-48">
          <DepartmentSelect
            value={params.deptId}
            onSelect={(val) => setParams({ ...params, deptId: val })}
            className="block w-full px-3 py-1.5 text-sm border-gray-300 dark:border-gray-600 bg-transparent rounded focus:ring-primary focus:border-primary dark:text-gray-200 cursor-pointer transition-all"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">筛选员工</label>
        <div className="relative group">
          <select
            className="block w-48 px-3 py-1.5 text-sm border-gray-300 dark:border-gray-600 bg-transparent rounded focus:ring-primary focus:border-primary dark:text-gray-200 cursor-pointer transition-all"
            value={params.employeeId}
            onChange={(e) => setParams({ ...params, employeeId: e.target.value })}
          >
            <option value="">全部员工</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 ml-auto">
        <button
          onClick={onSearch}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-1.5 rounded text-sm font-medium transition shadow-sm flex items-center gap-1 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">search</span>
          查询
        </button>
        <button
          onClick={onReset}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-1.5 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95"
        >
          重置
        </button>
      </div>
    </section>
  );
};

export default PunchFilter;
