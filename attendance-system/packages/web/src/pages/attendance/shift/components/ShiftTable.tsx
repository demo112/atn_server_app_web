import React from 'react';
import { Shift } from '../types';

interface ShiftTableProps {
  shifts: Shift[];
  onDelete: (id: string) => void;
  onEdit: (shift: Shift) => void;
}

const ShiftTable: React.FC<ShiftTableProps> = ({ shifts, onDelete, onEdit }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 h-[48px]">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">班次名称</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">考勤时间</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shifts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                  <span className="material-icons text-4xl block mb-2 mx-auto text-gray-300">folder_open</span>
                  暂无班次数据
                </td>
              </tr>
            ) : (
              shifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50 transition-colors h-[56px]">
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {shift.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col gap-1">
                      {shift.times.map((t, i) => (
                        <span key={i} className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {t.clockIn} - {t.clockOut}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEdit(shift)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-md transition-colors" 
                        title="编辑"
                      >
                        <span className="material-icons text-lg">edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(shift.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                        title="删除"
                      >
                        <span className="material-icons text-lg">delete</span>
                      </button>
                    </div>
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

export default ShiftTable;
