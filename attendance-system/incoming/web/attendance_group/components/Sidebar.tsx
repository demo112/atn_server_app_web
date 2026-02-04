
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView }) => {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 h-full flex flex-col shrink-0">
      <div className="py-4">
        {/* Attendance Config Section */}
        <div className="group">
          <div className="px-4 py-2 flex items-center justify-between text-gray-500 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="material-icons text-lg">settings</span>
              <span className="text-sm font-semibold">考勤配置</span>
            </div>
            <span className="material-icons text-xs">keyboard_arrow_down</span>
          </div>
          <div className="mt-1">
            <a href="#" className="block pl-12 pr-4 py-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">班次配置</a>
            <a 
              href="#" 
              className={`block pl-12 pr-4 py-2 text-sm transition-colors border-r-2 ${
                currentView === ViewType.LIST 
                ? 'text-blue-600 bg-blue-50 border-blue-600 font-medium' 
                : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              考勤组配置
            </a>
          </div>
        </div>

        {/* Other Sections */}
        <div className="px-4 py-3 flex items-center justify-between text-gray-500 cursor-pointer hover:bg-gray-50 mt-2">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-lg">event_available</span>
            <span className="text-sm font-semibold">考勤处理</span>
          </div>
          <span className="material-icons text-xs">chevron_right</span>
        </div>

        <div className="px-4 py-3 flex items-center justify-between text-gray-500 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="material-icons text-lg">bar_chart</span>
            <span className="text-sm font-semibold">考勤统计</span>
          </div>
          <span className="material-icons text-xs">chevron_right</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
