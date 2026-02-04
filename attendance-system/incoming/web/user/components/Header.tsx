
import React from 'react';

const Header: React.FC = () => {
  const navItems = ['首页', '团队管理', '设备管理', '考勤管理', '访客管理', '门禁管理'];
  
  return (
    <header className="bg-[#1e4ea1] text-white flex items-center justify-between px-6 h-14 shadow-md shrink-0 z-30">
      <div className="flex items-center space-x-10 h-full">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-3xl">cloud</span>
          <span className="text-xl font-bold tracking-tight">宇视云</span>
        </div>
        
        <nav className="hidden lg:flex items-center h-full">
          {navItems.map((item, idx) => (
            <a 
              key={item} 
              href="#" 
              className={`px-4 flex items-center h-full transition-colors hover:bg-white/10 ${idx === 1 ? 'bg-white/20 font-medium' : ''}`}
            >
              {item}
              {item === '门禁管理' && <span className="material-icons text-sm ml-1">keyboard_arrow_down</span>}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-1 bg-white/10 px-3 py-1 rounded border border-white/20 cursor-pointer hover:bg-white/20">
          <span className="text-white/80">团队模式</span>
          <span className="font-medium">atnd01_de...</span>
          <span className="material-icons text-sm">keyboard_arrow_down</span>
        </div>
        
        <div className="flex items-center space-x-2 cursor-pointer group">
          <span className="material-icons bg-orange-400 rounded-full p-1 text-[10px] h-5 w-5 flex items-center justify-center">person</span>
          <span className="group-hover:text-blue-200">帮助</span>
          <span className="material-icons text-sm">keyboard_arrow_down</span>
        </div>
        
        <span className="cursor-pointer hover:text-blue-200">宇视云开放平台</span>
        <span className="cursor-pointer hover:text-blue-200">宇视官网</span>
      </div>
    </header>
  );
};

export default Header;
