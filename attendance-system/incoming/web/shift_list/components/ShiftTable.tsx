
import React from 'react';
import { Shift } from '../types';

interface ShiftTableProps {
  shifts: Shift[];
  onDelete: (id: number) => void;
}

const ShiftTable: React.FC<ShiftTableProps> = ({ shifts, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">Shift Name</th>
                <th className="px-6 py-4">Attendance Time</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {shifts.length > 0 ? (
                shifts.map((shift) => (
                  <tr key={shift.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{shift.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{shift.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors" title="Edit">
                          <span className="material-icons text-xl">edit</span>
                        </button>
                        <button 
                          onClick={() => onDelete(shift.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors" 
                          title="Delete"
                        >
                          <span className="material-icons text-xl">delete_outline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                    <span className="material-icons text-4xl block mb-2">folder_off</span>
                    No shifts found
                  </td>
                </tr>
              )}
              {/* Add empty rows to maintain visual structure if needed */}
              {Array.from({ length: Math.max(0, 5 - shifts.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-14 border-transparent">
                  <td colSpan={4}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between text-sm text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center space-x-4">
          <span className="font-medium">Total {shifts.length} item{shifts.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center space-x-1">
            <span className="text-xs">Show</span>
            <select className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md text-xs py-1 px-2 focus:ring-blue-500">
              <option>20 / page</option>
              <option>50 / page</option>
              <option>100 / page</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 hover:bg-slate-50">
              <span className="material-icons text-sm">chevron_left</span>
            </button>
            <button className="z-10 bg-blue-600 border-blue-600 text-white relative inline-flex items-center px-4 py-2 border text-sm font-bold">1</button>
            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 hover:bg-slate-50">
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </nav>
          <div className="flex items-center space-x-1.5 ml-2">
            <span>Go to</span>
            <input className="w-12 text-center py-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium focus:ring-blue-500" type="text" defaultValue="1"/>
            <span>Page</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftTable;
