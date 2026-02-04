
import React from 'react';
import { TabKey } from '../types';
import { AVATAR_URL } from '../constants.tsx';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">cloud</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">UniCloud</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-1 h-16">
          {[
            { id: 'home', label: '首页' },
            { id: 'access', label: '门禁管理' },
            { id: 'attendance', label: '考勤管理' },
            { id: 'hr', label: '人事管理' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as TabKey)}
              className={`px-4 h-full text-sm font-medium transition-all relative flex items-center ${
                activeTab === tab.id 
                  ? 'text-primary' 
                  : 'text-slate-500 hover:text-primary'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-3 mr-4">
          <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-md cursor-pointer hover:bg-slate-200 transition-colors">
            <span className="text-xs text-slate-600">团队模式: atnd01_de...</span>
            <span className="material-symbols-outlined text-slate-400 text-sm">keyboard_arrow_down</span>
          </div>
          <button className="text-slate-500 hover:text-primary flex items-center gap-1 text-sm font-medium">
            <span className="material-symbols-outlined text-base">help</span> 帮助
          </button>
        </div>
        
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            <img alt="User" src={AVATAR_URL} className="w-full h-full object-cover" />
          </div>
          <span className="hidden sm:inline text-sm font-medium text-slate-700">管理员</span>
          <span className="material-symbols-outlined text-slate-400 text-lg group-hover:text-primary">keyboard_arrow_down</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
