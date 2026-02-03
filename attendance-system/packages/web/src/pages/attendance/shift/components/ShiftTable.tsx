import React from 'react';
import { EditOutlined, DeleteOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Shift } from '../types';

interface ShiftTableProps {
  shifts: Shift[];
  onDelete: (id: string) => void;
  onEdit: (shift: Shift) => void;
}

const ShiftTable: React.FC<ShiftTableProps> = ({ shifts, onDelete, onEdit }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4">Shift Name</th>
              <th className="px-6 py-4">Attendance Time</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {shifts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                  <FolderOpenOutlined className="text-4xl block mb-2 mx-auto" />
                  No shifts found
                </td>
              </tr>
            ) : (
              shifts.map((shift) => (
                <tr key={shift.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {shift.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex flex-col gap-1">
                      {shift.times.map((t, i) => (
                        <span key={i} className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {t.clockIn} - {t.clockOut}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEdit(shift)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" 
                        title="Edit"
                      >
                        <EditOutlined className="text-lg" />
                      </button>
                      <button 
                        onClick={() => onDelete(shift.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors" 
                        title="Delete"
                      >
                        <DeleteOutlined className="text-lg" />
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
