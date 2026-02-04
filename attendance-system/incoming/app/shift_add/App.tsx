
import React, { useState } from 'react';
import { ShiftSettings, TimeSegment } from './types';
import SegmentCard from './components/SegmentCard';

const App: React.FC = () => {
  const [shift, setShift] = useState<ShiftSettings>({
    name: '',
    segments: [
      {
        id: '1',
        startTime: '09:00',
        endTime: '17:00',
        mustSignIn: true,
        signInRange: '08:30-09:30',
        mustSignOut: true,
        signOutRange: '16:30-17:30',
      }
    ],
    allowedLateMinutes: 0,
    allowedEarlyLeaveMinutes: 0,
  });

  const addSegment = () => {
    const newId = (shift.segments.length + 1).toString();
    setShift({
      ...shift,
      segments: [
        ...shift.segments,
        {
          id: newId,
          startTime: '09:00',
          endTime: '17:00',
          mustSignIn: true,
          signInRange: '08:30-09:30',
          mustSignOut: true,
          signOutRange: '16:30-17:30',
        }
      ]
    });
  };

  const updateSegment = (index: number, updated: TimeSegment) => {
    const newSegments = [...shift.segments];
    newSegments[index] = updated;
    setShift({ ...shift, segments: newSegments });
  };

  const handleSave = () => {
    if (!shift.name) {
      alert('请输入班次名称');
      return;
    }
    console.log('Saving Shift Config:', shift);
    alert('配置已成功保存！');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-bg-ios pb-safe shadow-2xl relative overflow-hidden">
      
      {/* iOS Status Bar Emulation */}
      <div className="h-12 flex justify-between items-end px-6 pb-2 sticky top-0 z-50 bg-bg-ios/90 backdrop-blur-md">
        <span className="text-[14px] font-bold tracking-tight">10:12</span>
        <div className="flex gap-1.5 items-center">
          <span className="material-icons-outlined text-[16px]">signal_cellular_alt</span>
          <span className="material-icons-outlined text-[16px]">wifi</span>
          <span className="material-icons-outlined text-[16px]">battery_full</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 sticky top-12 z-50 bg-bg-ios/90 backdrop-blur-md">
        <button className="p-2 -ml-2 text-primary hover:opacity-70 transition-opacity">
          <span className="material-icons-outlined text-2xl font-bold">arrow_back_ios_new</span>
        </button>
        <h1 className="text-[17px] font-bold tracking-tight">添加班次</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-6">
        
        {/* Shift Name Input Card */}
        <div className="bg-card-ios rounded-ios-xl p-4 shadow-sm border border-gray-100 flex flex-col">
          <label className="text-[13px] font-medium text-gray-600 mb-1">
            <span className="text-red-500 mr-1">*</span>班次名称
          </label>
          <input 
            type="text" 
            value={shift.name}
            onChange={(e) => setShift({ ...shift, name: e.target.value })}
            placeholder="请输入" 
            className="w-full bg-transparent border-none p-0 focus:ring-0 text-[17px] text-gray-900 placeholder-gray-300 font-medium"
          />
        </div>

        {/* Time Segments */}
        <section className="space-y-4">
          <div className="px-1">
            <h2 className="text-[13px] font-medium text-gray-500">
              上下班设置 ({shift.segments.length}/3)
            </h2>
          </div>
          
          {shift.segments.map((seg, idx) => (
            <SegmentCard 
              key={seg.id} 
              segment={seg} 
              index={idx} 
              onUpdate={(updated) => updateSegment(idx, updated)} 
            />
          ))}

          {shift.segments.length < 3 && (
            <button 
              onClick={addSegment}
              className="w-full bg-card-ios hover:bg-gray-50 rounded-ios-xl py-4 flex justify-center items-center gap-2 text-primary font-bold shadow-sm border border-gray-100 active:scale-95 transition-all"
            >
              <span className="material-icons-outlined text-xl">add</span>
              添加时间段
            </button>
          )}
        </section>

        {/* Absence Settings */}
        <section className="space-y-2">
          <div className="px-1">
            <h2 className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">缺勤设置</h2>
          </div>
          <div className="bg-card-ios rounded-ios-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <div className="flex justify-between items-center p-4 active:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-[15px] text-gray-700">允许迟到时长</span>
              <div className="flex items-center text-[15px] text-gray-500">
                {shift.allowedLateMinutes}分钟
                <span className="material-icons-outlined text-gray-300 text-lg ml-1">chevron_right</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 active:bg-gray-50 transition-colors cursor-pointer">
              <span className="text-[15px] text-gray-700">允许早退时长</span>
              <div className="flex items-center text-[15px] text-gray-500">
                {shift.allowedEarlyLeaveMinutes}分钟
                <span className="material-icons-outlined text-gray-300 text-lg ml-1">chevron_right</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Spacing for fixed footer */}
        <div className="h-24"></div>
      </main>

      {/* Footer Button Container */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-bg-ios via-bg-ios to-transparent pt-10 z-50">
        <button 
          onClick={handleSave}
          className="w-full bg-primary text-white py-[15px] rounded-[14px] text-[17px] font-bold shadow-xl shadow-primary/20 active:scale-[0.97] transition-all"
        >
          保存
        </button>
        {/* iOS Home Indicator */}
        <div className="flex justify-center mt-4">
          <div className="w-32 h-[5px] bg-gray-300 rounded-full"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
