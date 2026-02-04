import React from 'react';
import { DeptStatsVo } from '@attendance/shared';

interface Props {
  data: DeptStatsVo[];
  loading?: boolean;
}

const DeptStatsTable: React.FC<Props> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">部门考勤统计</h3>
        </div>
        <div className="p-6 text-center text-gray-500">
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">部门考勤统计</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                部门
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                总人数
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                出勤率
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                正常
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                迟到
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                早退
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                缺勤
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                请假
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500 text-sm">
                  暂无数据
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.deptId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.deptName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.totalHeadcount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.attendanceRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.normalCount}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${record.lateCount > 0 ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                    {record.lateCount}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${record.earlyLeaveCount > 0 ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                    {record.earlyLeaveCount}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${record.absentCount > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    {record.absentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.leaveCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeptStatsTable;
