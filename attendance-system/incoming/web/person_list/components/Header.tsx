
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-14 bg-primary text-white flex items-center justify-between px-4 z-50 shadow-md flex-shrink-0">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <span className="material-icons-round text-3xl">cloud_queue</span>
          <span className="text-lg font-bold tracking-tight">宇视云</span>
        </div>
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium h-14">
          <a className="hover:text-blue-100 transition opacity-80 hover:opacity-100" href="#">首页</a>
          <a className="hover:text-blue-100 transition opacity-80 hover:opacity-100" href="#">设备管理</a>
          <a className="hover:text-blue-100 transition opacity-80 hover:opacity-100" href="#">考勤管理</a>
          <a className="hover:text-blue-100 transition opacity-80 hover:opacity-100" href="#">访客管理</a>
          <a className="hover:text-blue-100 transition opacity-80 hover:opacity-100" href="#">门禁管理</a>
          <div className="h-full border-b-4 border-white flex items-center px-4 bg-white/10">
            <a href="#">人员管理</a>
          </div>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center bg-white/10 px-3 py-1 rounded cursor-pointer border border-white/20 hover:bg-white/20 transition">
          <span className="max-w-[120px] truncate">团队模式 atnd01_de...</span>
          <span className="material-icons-round text-sm ml-1">expand_more</span>
        </div>
        <div className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-xs overflow-hidden border border-white/20">
            <span className="material-icons-round">person</span>
          </div>
          <span className="material-icons-round text-sm">expand_more</span>
        </div>
        <div className="hidden xl:flex items-center space-x-3 text-xs border-l border-white/30 pl-4">
          <a className="hover:underline opacity-80" href="#">帮助</a>
          <a className="hover:underline opacity-80" href="#">宇视云开放平台</a>
          <a className="hover:underline opacity-80" href="#">宇视官网</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
