
import React from 'react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
  return (
    <header className="h-16 bg-primary text-white flex items-center justify-between px-6 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="material-icons-round text-3xl">cloud</span>
          <span className="text-xl font-bold tracking-tight">宇视云</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          <a className="px-4 py-2 hover:bg-white/10 rounded-md transition-colors" href="#">首页</a>
          <a className="px-4 py-2 hover:bg-white/10 rounded-md transition-colors" href="#">门禁管理</a>
          <a className="px-4 py-2 bg-white/20 rounded-md font-medium transition-colors" href="#">考勤管理</a>
          <a className="px-4 py-2 hover:bg-white/10 rounded-md transition-colors" href="#">人员管理</a>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg text-sm border border-white/20">
          <span>团队模式</span>
          <span className="opacity-70 mx-1">|</span>
          <span className="font-medium">atnd01_de...</span>
          <span className="material-icons-round text-sm">expand_more</span>
        </div>
        
        <div className="flex items-center gap-4 border-l border-white/20 pl-4">
          <button className="hover:bg-white/10 p-2 rounded-full transition-colors relative">
            <span className="material-icons-round">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-primary"></span>
          </button>
          <button className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <span className="material-icons-round">help_outline</span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 pr-3 rounded-full transition-colors">
            <img 
              alt="User avatar" 
              className="w-8 h-8 rounded-full border border-white/20" 
              src="https://picsum.photos/seed/admin/40/40" 
            />
            <span className="text-sm font-medium hidden sm:inline">管理员</span>
          </div>
          <button 
            className="p-2 rounded-full hover:bg-white/10 transition-colors" 
            onClick={onToggleDarkMode}
          >
            <span className="material-icons-round">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
