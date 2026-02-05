import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

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
        {user && (
          <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded border border-white/20 hover:bg-white/20 transition-colors">
            <span className="material-icons text-sm">person</span>
            <span className="font-medium">{user.name || user.username}</span>
            <span className="text-xs bg-blue-600 px-1.5 py-0.5 rounded opacity-80">
              {user.role === 'admin' ? '管理员' : '员工'}
            </span>
          </div>
        )}
        
        <button 
          onClick={logout}
          className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
          title="退出登录"
        >
          <span className="material-icons text-lg">logout</span>
          <span className="hidden sm:inline">退出</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
