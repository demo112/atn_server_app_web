import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  subItems?: NavItem[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems: NavItem[] = [
    { id: 'user', label: '用户管理', path: '/users', icon: 'person' },
    { id: 'employee', label: '人员管理', path: '/employees', icon: 'badge' },
    { 
      id: 'attendance', 
      label: '考勤管理', 
      path: '/attendance', 
      icon: 'access_time',
      subItems: [
        { id: 'daily', label: '每日考勤', path: '/attendance/daily-records' },
        { id: 'shift', label: '班次管理', path: '/attendance/shifts' },
        { id: 'schedule', label: '排班管理', path: '/attendance/schedule' },
        { id: 'correction', label: '补签记录', path: '/attendance/correction' },
        { id: 'correction-processing', label: '补签处理', path: '/attendance/correction-processing' },
        { id: 'leave', label: '请假管理', path: '/attendance/leave' },
      ]
    },
    { 
      id: 'statistics', 
      label: '统计报表', 
      path: '/statistics', 
      icon: 'bar_chart',
      subItems: [
        { id: 'dashboard', label: '统计仪表盘', path: '/statistics/dashboard' },
        { id: 'summary', label: '个人汇总', path: '/statistics/summary' },
        { id: 'reports', label: '统计报表', path: '/statistics/reports' },
      ]
    },
    { id: 'setting', label: '考勤设置', path: '/attendance/settings', icon: 'settings' },
  ];

  const isActive = (item: NavItem) => {
    if (item.path === '/' && currentPath === '/') return true;
    if (item.path !== '/' && currentPath.startsWith(item.path)) return true;
    return false;
  };

  return (
    <aside className="w-48 bg-white border-r border-gray-200 shrink-0 z-20 overflow-y-auto flex flex-col h-full">
      <ul className="py-2 flex-1">
        {menuItems.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.id}>
              <Link 
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors no-underline ${
                  active 
                  ? 'bg-blue-50 text-primary border-r-4 border-primary' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon && <span className="material-icons text-xl">{item.icon}</span>}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.subItems && <span className="material-icons text-xs">keyboard_arrow_down</span>}
              </Link>
              
              {/* Simple Submenu Rendering if active or explicitly expanded (can be improved) */}
              {active && item.subItems && (
                <ul className="bg-gray-50 py-1">
                  {item.subItems.map(sub => (
                    <li key={sub.id}>
                      <Link
                        to={sub.path}
                        className={`block pl-12 pr-4 py-2 text-sm transition-colors no-underline ${
                          currentPath === sub.path
                          ? 'text-primary font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
