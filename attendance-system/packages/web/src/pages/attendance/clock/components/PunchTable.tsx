import React from 'react';
import type { ClockRecord } from '@attendance/shared';
import dayjs from 'dayjs';

interface PunchTableProps {
  data: ClockRecord[];
  loading: boolean;
}

const getMethodBadge = (source: string) => {
  switch (source) {
    case 'device':
      return (
        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800/50">
          设备打卡
        </span>
      );
    case 'app':
      return (
        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800/50">
          手机打卡
        </span>
      );
    case 'web':
      return (
        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-800/50">
          网页补录
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700">
          未知来源
        </span>
      );
  }
};

const getTypeBadge = (type: string) => {
  return type === 'sign_in' ? (
    <span className="text-green-600 font-medium">上班打卡</span>
  ) : (
    <span className="text-orange-600 font-medium">下班打卡</span>
  );
};

const PunchTable: React.FC<PunchTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-gray-400">
        <span className="material-symbols-outlined animate-spin text-3xl">refresh</span>
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 min-h-[300px]">
        <span className="material-symbols-outlined text-5xl mb-2 text-gray-300">inbox</span>
        <span>暂无打卡记录</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-gray-800 border-x border-b border-gray-200 dark:border-gray-700 min-w-max">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0 z-10 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-3.5 font-semibold">姓名</th>
            <th className="px-6 py-3.5 font-semibold">部门</th>
            <th className="px-6 py-3.5 font-semibold">工号</th>
            <th className="px-6 py-3.5 font-semibold">打卡时间</th>
            <th className="px-6 py-3.5 font-semibold">打卡类型</th>
            <th className="px-6 py-3.5 font-semibold">打卡方式</th>
            <th className="px-6 py-3.5 font-semibold">设备信息</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
          {data.map((record) => (
            <tr
              key={record.id}
              className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors text-gray-700 dark:text-gray-300"
            >
              <td className="px-6 py-4 font-medium">{record.employeeName || '-'}</td>
              <td className="px-6 py-4 truncate max-w-[150px]">{record.deptName || '-'}</td>
              <td className="px-6 py-4 font-mono text-xs text-gray-500">{record.employeeNo || record.employeeId}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium">{dayjs(record.clockTime).format('HH:mm:ss')}</span>
                  <span className="text-xs text-gray-400">{dayjs(record.clockTime).format('YYYY-MM-DD')}</span>
                </div>
              </td>
              <td className="px-6 py-4">{getTypeBadge(record.type)}</td>
              <td className="px-6 py-4">{getMethodBadge(record.source)}</td>
              <td className="px-6 py-4 font-mono text-xs text-gray-400 group relative">
                {record.deviceSn ? (
                  <>
                    <span className="cursor-help border-b border-dashed border-gray-300">{record.deviceSn.slice(0, 8)}...</span>
                    <div className="absolute bottom-full left-0 hidden group-hover:block bg-gray-900 text-white p-2 rounded text-[10px] z-20 mb-2 whitespace-nowrap shadow-xl">
                      设备SN: {record.deviceSn}
                      {record.deviceInfo && (
                        <>
                          <br />
                          型号: {record.deviceInfo.model || '-'}
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PunchTable;
