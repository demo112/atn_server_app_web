import React, { useState, useEffect } from 'react';
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const menuItems: NavItem[] = [
    { id: 'user', label: '用户管理', path: '/users', icon: 'person' },
    { id: 'employee', label: '人员管理', path: '/employees', icon: 'badge' },
    {
      id: 'attendance-config',
      label: '考勤配置',
      path: '/attendance-config',
      icon: 'settings',
      subItems: [
        { id: 'setting', label: '考勤设置', path: '/attendance/settings' },
        { id: 'shift', label: '班次管理', path: '/attendance/shifts' },
        { id: 'schedule', label: '排班管理', path: '/attendance/schedule' },
      ]
    },
    { 
      id: 'attendance-processing', 
      label: '考勤处理', 
      path: '/attendance-processing', 
      icon: 'access_time',
      subItems: [
        { id: 'correction-processing', label: '补签处理', path: '/attendance/correction-processing' },
        { id: 'correction', label: '补签记录', path: '/attendance/correction' },
        { id: 'leave', label: '请假管理', path: '/attendance/leave' },
      ]
    },
    { 
      id: 'statistics', 
      label: '考勤统计', 
      path: '/statistics', 
      icon: 'bar_chart',
      subItems: [
        { id: 'dashboard', label: '统计报表', path: '/statistics/dashboard' },
        { id: 'daily-records', label: '打卡记录', path: '/attendance/clock-records' },
      ]
    },
  ];

  // Effect to automatically expand menus based on current path
  useEffect(() => {
    const activeParent = menuItems.find(item => 
      item.subItems?.some(sub => currentPath.startsWith(sub.path))
    );
    if (activeParent) {
      setExpandedMenus(prev => {
        if (!prev.includes(activeParent.id)) {
          return [...prev, activeParent.id];
        }
        return prev;
      });
    }
  }, [currentPath]); // removed menuItems from dependency to avoid loop

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isActive = (item: NavItem) => {
    if (item.subItems) {
      return item.subItems.some(sub => currentPath.startsWith(sub.path));
    }
    if (item.path === '/' && currentPath === '/') return true;
    if (item.path !== '/' && currentPath.startsWith(item.path)) return true;
    return false;
  };

  return (
    <aside className="w-48 bg-white border-r border-gray-200 shrink-0 z-20 overflow-y-auto flex flex-col h-full">
      <ul className="py-2 flex-1">
        {menuItems.map((item) => {
          const active = isActive(item);
          const expanded = expandedMenus.includes(item.id);
          
          return (
            <li key={item.id}>
              {item.subItems ? (
                <div 
                  onClick={() => toggleMenu(item.id)}
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
                  <span className={`material-icons text-xs transition-transform duration-200 ${expanded ? 'transform rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </div>
              ) : (
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
                </Link>
              )}
              
              {item.subItems && expanded && (
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
