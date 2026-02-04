
import React from 'react';
import { Shift } from '../types';

interface ShiftTableProps {
  shifts: Shift[];
  onDelete: (id: string) => void;
}

const ShiftTable: React.FC<ShiftTableProps> = ({ shifts, onDelete }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <th className="px-6 py-3">Shift Name</th>
          <th className="px-6 py-3">Attendance Time</th>
          <th className="px-6 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {shifts.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
              No shifts found.
            </td>
          </tr>
        ) : (
          shifts.map((shift) => (
            <tr key={shift.id} className="text-sm hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-700">{shift.name}</td>
              <td className="px-6 py-4 text-gray-600">
                {shift.times.map((t, i) => (
                  <div key={i}>
                    {t.clockIn} - {t.clockOut}
                  </div>
                ))}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-blue-50">
                  <span className="material-icons text-lg">edit</span>
                </button>
                <button 
                  onClick={() => onDelete(shift.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 ml-2"
                >
                  <span className="material-icons text-lg">delete</span>
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default ShiftTable;
