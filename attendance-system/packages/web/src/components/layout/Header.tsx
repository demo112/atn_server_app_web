import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const navItems = [
    { label: '首页', path: '/' },
    { label: '团队管理', path: '/users' },
    { label: '设备管理', path: '#' },
    { label: '考勤管理', path: '/attendance/daily-records' },
    { label: '访客管理', path: '#' },
    { label: '门禁管理', path: '#' }
  ];
  
  return (
    <header className="bg-[#1e4ea1] text-white flex items-center justify-between px-6 h-14 shadow-md shrink-0 z-30">
      <div className="flex items-center space-x-10 h-full">
        <Link to="/" className="flex items-center space-x-2 text-white no-underline">
          <span className="material-icons text-3xl">cloud</span>
          <span className="text-xl font-bold tracking-tight">宇视云</span>
        </Link>
        
        <nav className="hidden lg:flex items-center h-full">
          {navItems.map((item, idx) => (
            <Link 
              key={item.label} 
              to={item.path} 
              className={`px-4 flex items-center h-full transition-colors hover:bg-white/10 text-white no-underline ${idx === 1 ? 'bg-white/20 font-medium' : ''}`}
            >
              {item.label}
              {item.label === '门禁管理' && <span className="material-icons text-sm ml-1">keyboard_arrow_down</span>}
            </Link>
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
