
import React from 'react';
import { Shift } from '../types';

interface ShiftListProps {
  shifts: Shift[];
}

const ShiftList: React.FC<ShiftListProps> = ({ shifts }) => {
  if (shifts.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400">
        <span className="material-icons-outlined text-5xl mb-3 opacity-20">search_off</span>
        <p className="text-sm">未找到相关班次</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shifts.map((shift) => (
        <div 
          key={shift.id}
          className="bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 active:bg-slate-50 dark:active:bg-slate-800 transition-all cursor-pointer group flex justify-between items-center"
        >
          <div className="space-y-1">
            <h3 className="font-semibold text-[17px] leading-tight text-slate-800 dark:text-slate-100">
              {shift.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {shift.startTime}-{shift.endTime}
            </p>
          </div>
          <span className="material-icons-outlined text-slate-300 group-hover:text-primary transition-colors">
            chevron_right
          </span>
        </div>
      ))}
    </div>
  );
};

export default ShiftList;
