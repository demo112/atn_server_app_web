
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#1e4fa3] text-white h-14 flex items-center justify-between px-6 shrink-0 z-50 shadow-md">
      <div className="flex items-center space-x-10">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-3xl">cloud_queue</span>
          <span className="text-xl font-bold tracking-tight">宇视云</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#" className="opacity-80 hover:opacity-100 transition">首页</a>
          <a href="#" className="opacity-80 hover:opacity-100 transition">设备管理</a>
          <a href="#" className="relative py-1 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-white">考勤管理</a>
          <a href="#" className="opacity-80 hover:opacity-100 transition">访客管理</a>
          <a href="#" className="opacity-80 hover:opacity-100 transition">门禁管理</a>
        </nav>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="bg-white/10 px-3 py-1 rounded-sm flex items-center space-x-2 text-sm cursor-pointer hover:bg-white/20 transition">
          <span>团队模式</span>
          <span className="opacity-70 text-xs font-mono">atnd01_de...</span>
          <span className="material-icons text-xs">keyboard_arrow_down</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 cursor-pointer hover:underline text-sm">
            <span className="material-icons text-lg">account_circle</span>
            <span className="material-icons text-xs">keyboard_arrow_down</span>
          </div>
          <a href="#" className="text-sm hover:underline">帮助</a>
          <div className="w-px h-3 bg-white/30" />
          <a href="#" className="text-sm hover:underline">宇视官网</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
