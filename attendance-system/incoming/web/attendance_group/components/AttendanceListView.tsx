
import React from 'react';
import { MOCK_GROUPS } from '../constants';
import { AttendanceGroup } from '../types';

interface AttendanceListViewProps {
  onAdd: () => void;
  onEdit: (group: AttendanceGroup) => void;
}

const AttendanceListView: React.FC<AttendanceListViewProps> = ({ onAdd, onEdit }) => {
  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onAdd}
            className="bg-[#409eff] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 transition shadow-sm"
          >
            <span className="material-icons text-sm">add</span>
            <span>添加考勤组</span>
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded flex items-center space-x-2 hover:bg-gray-50 transition text-gray-600">
            <span className="material-icons text-sm">refresh</span>
            <span>刷新</span>
          </button>
        </div>
        <div className="relative max-w-sm w-full">
          <span className="absolute left-3 top-2.5 material-icons text-gray-400 text-sm">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 transition" 
            placeholder="请输入考勤组名称" 
            type="text"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-4 text-xs text-gray-500 flex items-center space-x-2 bg-yellow-50 p-2 rounded border border-yellow-100">
        <span className="material-icons text-sm text-yellow-500">info</span>
        <span>注：1. 新建考勤组后请在【权限组配置】页面手动为人员下发权限；2. 失效考勤组最多保留100个，超出后将优先覆盖最早失效的考勤组。</span>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">考勤组名称</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">人数</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">班次名称</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">有效期日期</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center space-x-1">
                  <span>状态</span>
                  <span className="material-icons text-xs">unfold_more</span>
                </div>
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_GROUPS.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50 transition group">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{group.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{group.memberCount}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{group.shiftName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{group.expiryDate}</td>
                <td className="px-6 py-4 text-sm">
                  {group.status === 'valid' ? (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">有效</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">已过期</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(group)}
                      className="text-gray-400 hover:text-blue-500 transition" 
                      title="编辑"
                    >
                      <span className="material-icons text-lg">edit</span>
                    </button>
                    <button className="text-gray-400 hover:text-red-500 transition" title="删除">
                      <span className="material-icons text-lg">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">共 {MOCK_GROUPS.length} 条数据</span>
          <div className="flex space-x-2">
            <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-white text-gray-400 disabled:opacity-50">
              <span className="material-icons text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-white text-gray-400">
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceListView;
