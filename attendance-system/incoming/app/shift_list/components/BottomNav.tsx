
import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card-light/95 dark:bg-card-dark/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-bottom flex justify-around items-center pt-2 pb-1 z-20">
      <button 
        onClick={() => onTabChange(Tab.ShiftConfig)}
        className={`flex flex-col items-center py-1 flex-1 group transition-all ${activeTab === Tab.ShiftConfig ? 'text-primary' : 'text-slate-500 opacity-60'}`}
      >
        <div className={`rounded-lg p-1 group-active:scale-90 transition-transform ${activeTab === Tab.ShiftConfig ? 'bg-primary/10' : ''}`}>
          <span className="material-icons-outlined">event_note</span>
        </div>
        <span className="text-[10px] mt-1 font-bold">班次配置</span>
      </button>

      <button 
        onClick={() => onTabChange(Tab.AttendanceGroup)}
        className={`flex flex-col items-center py-1 flex-1 group transition-all ${activeTab === Tab.AttendanceGroup ? 'text-primary' : 'text-slate-500 opacity-60'}`}
      >
        <div className={`rounded-lg p-1 group-active:scale-90 transition-transform ${activeTab === Tab.AttendanceGroup ? 'bg-primary/10' : ''}`}>
          <span className="material-icons-outlined">groups</span>
        </div>
        <span className="text-[10px] mt-1 font-bold">考勤组配置</span>
      </button>
    </nav>
  );
};

export default BottomNav;
