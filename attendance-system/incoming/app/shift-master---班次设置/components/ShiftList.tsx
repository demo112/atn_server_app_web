
import React from 'react';
import { Shift } from '../types';

interface ShiftListProps {
  shifts: Shift[];
  onAddShift: () => void;
  onEditShift: (shift: Shift) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ShiftList: React.FC<ShiftListProps> = ({ shifts, onAddShift, onEditShift, searchQuery, onSearchChange }) => {
  const filteredShifts = shifts.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white px-4 pb-4 pt-2 shadow-sm">
        <h1 className="text-center text-lg font-bold mb-4">班次设置</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons-round text-gray-400 text-xl">search</span>
          </div>
          <input 
            className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-gray-100 text-sm placeholder-gray-500 focus:ring-0 focus:outline-none transition-colors" 
            placeholder="搜索班次" 
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        <button 
          onClick={onAddShift}
          className="w-full bg-[#007AFF] hover:bg-blue-600 text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all mb-6"
        >
          <span className="material-icons-round text-xl">add</span>
          <span>添加班次</span>
        </button>

        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-base font-bold text-gray-800">
            班次列表 <span className="text-green-500 ml-1 font-normal">({filteredShifts.length}/{Math.max(100, shifts.length)})</span>
          </h2>
        </div>

        <div className="space-y-3">
          {filteredShifts.length > 0 ? (
            filteredShifts.map(shift => (
              <div 
                key={shift.id}
                onClick={() => onEditShift(shift)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-1 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="text-base font-bold text-gray-800">{shift.name}</div>
                <div className="text-sm text-gray-500 font-medium">
                  {shift.timeSlots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ')}
                </div>
              </div>
            ))
          ) : (
            <div className="mt-12 text-center">
              <p className="text-sm text-gray-400">没有匹配的班次数据</p>
            </div>
          )}
          
          {filteredShifts.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">没有更多数据</p>
            </div>
          )}
        </div>
      </main>

      <nav className="bg-white border-t border-gray-100 pb-safe fixed bottom-0 w-full z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 pb-2"> 
          <button className="flex flex-col items-center justify-center w-1/2">
            <span className="material-icons-round text-2xl text-[#007AFF]">calendar_today</span>
            <span className="text-[10px] font-medium mt-0.5 text-[#007AFF]">班次配置</span>
          </button>
          <button className="flex flex-col items-center justify-center w-1/2 opacity-40">
            <span className="material-icons-round text-2xl text-gray-400">groups</span>
            <span className="text-[10px] font-medium mt-0.5 text-gray-400">考勤组配置</span>
          </button>
        </div>
        <div className="h-1.5 w-32 bg-gray-200 rounded-full mx-auto mb-2"></div>
      </nav>
    </div>
  );
};

export default ShiftList;
