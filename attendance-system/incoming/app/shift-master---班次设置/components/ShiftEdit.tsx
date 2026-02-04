
import React, { useState } from 'react';
import { Shift, TimeSlot } from '../types';
import IOSSwitch from './IOSSwitch';

interface ShiftEditProps {
  shift: Shift | null;
  onSave: (shift: Shift) => void;
  onCancel: () => void;
}

const ShiftEdit: React.FC<ShiftEditProps> = ({ shift, onSave, onCancel }) => {
  const [name, setName] = useState(shift?.name || '');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(shift?.timeSlots || [{
    id: Math.random().toString(36).substr(2, 9),
    startTime: '09:00',
    endTime: '17:00',
    mustCheckIn: true,
    checkInWindow: '08:30-09:30',
    mustCheckOut: true,
    checkOutWindow: '16:30-17:30'
  }]);

  const handleAddTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      id: Math.random().toString(36).substr(2, 9),
      startTime: '09:00',
      endTime: '17:00',
      mustCheckIn: true,
      checkInWindow: '08:30-09:30',
      mustCheckOut: true,
      checkOutWindow: '16:30-17:30'
    }]);
  };

  const updateTimeSlot = (id: string, updates: Partial<TimeSlot>) => {
    setTimeSlots(timeSlots.map(slot => slot.id === id ? { ...slot, ...updates } : slot));
  };

  const handleSave = () => {
    if (!name.trim()) return alert('请输入班次名称');
    onSave({
      id: shift?.id || Math.random().toString(36).substr(2, 9),
      name,
      timeSlots
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7]">
      <nav className="bg-white sticky top-12 z-40 px-3 py-2 flex items-center justify-between border-b border-gray-100/50">
        <button onClick={onCancel} className="p-2 -ml-2 text-black active:opacity-40 transition-opacity">
          <span className="material-symbols-outlined text-3xl">chevron_left</span>
        </button>
        <h1 className="text-[17px] font-bold flex-1 text-center pr-8">
          {shift ? '编辑班次详情' : '新增班次详情'}
        </h1>
      </nav>

      <main className="flex-1 overflow-y-auto px-4 pt-4 space-y-6 pb-32 no-scrollbar">
        {/* Name Input */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block text-[15px] font-medium text-gray-500 mb-1">班次名称</label>
          <input 
            className="w-full bg-transparent border-none p-0 text-[17px] font-medium placeholder-gray-300 focus:ring-0" 
            placeholder="请输入班次名称" 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Time Slots Section */}
        <div>
          <div className="text-gray-500 text-[13px] mb-2 ml-4">打卡设置 ({timeSlots.length}/3)</div>
          <div className="space-y-4">
            {timeSlots.map((slot, index) => (
              <div key={slot.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 py-3.5 border-b border-gray-100 font-bold text-[17px]">
                  时段 {index + 1}
                </div>
                
                {/* Check In Section */}
                <div className="p-4 border-b border-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[17px] font-medium">上班时间</span>
                    <div className="flex items-center text-gray-400 cursor-pointer">
                      <span className="text-[17px] text-black mr-1 font-semibold tracking-wide">{slot.startTime}</span>
                      <span className="material-symbols-outlined text-xl opacity-40">chevron_right</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-1">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-[15px]">必须签到</span>
                      <IOSSwitch 
                        checked={slot.mustCheckIn} 
                        onChange={(val) => updateTimeSlot(slot.id, { mustCheckIn: val })} 
                      />
                    </div>
                    <div className="flex justify-between items-center py-3 cursor-pointer">
                      <span className="text-[15px]">签到时间段</span>
                      <div className="flex items-center text-gray-400">
                        <span className="text-[15px] mr-1">{slot.checkInWindow}</span>
                        <span className="material-symbols-outlined text-lg opacity-40">chevron_right</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Check Out Section */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[17px] font-medium">下班时间</span>
                    <div className="flex items-center text-gray-400 cursor-pointer">
                      <span className="text-[17px] text-black mr-1 font-semibold tracking-wide">{slot.endTime}</span>
                      <span className="material-symbols-outlined text-xl opacity-40">chevron_right</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-1">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-[15px]">必须签退</span>
                      <IOSSwitch 
                        checked={slot.mustCheckOut} 
                        onChange={(val) => updateTimeSlot(slot.id, { mustCheckOut: val })} 
                      />
                    </div>
                    <div className="flex justify-between items-center py-3 cursor-pointer">
                      <span className="text-[15px]">签退时间段</span>
                      <div className="flex items-center text-gray-400">
                        <span className="text-[15px] mr-1">{slot.checkOutWindow}</span>
                        <span className="material-symbols-outlined text-lg opacity-40">chevron_right</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {timeSlots.length < 3 && (
          <button 
            onClick={handleAddTimeSlot}
            className="w-full bg-white text-[#007AFF] rounded-xl py-4 flex items-center justify-center gap-1 font-bold active:bg-gray-50 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-xl font-bold">add</span>
            <span className="text-[17px]">添加时段</span>
          </button>
        )}

        <div>
          <div className="text-gray-500 text-[13px] mb-2 ml-4">考勤设置</div>
          <div className="bg-white rounded-xl h-16 shadow-sm relative overflow-hidden flex items-center px-4">
            <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7] to-transparent">
        <button 
          onClick={handleSave}
          className="w-full bg-[#007AFF] text-white rounded-full py-4 font-bold text-[17px] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
        >
          保存
        </button>
        <div className="h-4 w-full"></div>
      </div>
    </div>
  );
};

export default ShiftEdit;
