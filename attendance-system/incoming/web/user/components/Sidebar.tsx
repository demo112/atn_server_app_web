
import React from 'react';
import { NavItem } from '../types';

const Sidebar: React.FC = () => {
  const menuItems: NavItem[] = [
    { id: 'user', label: '用户管理', icon: 'person' },
    { id: 'role', label: '角色管理', icon: 'verified_user' },
    { id: 'setting', label: '团队设置', icon: 'settings' },
    { id: 'log', label: '操作日志', icon: 'history' },
  ];

  return (
    <aside className="w-48 bg-white border-r border-gray-200 shrink-0 z-20 overflow-y-auto">
      <ul className="py-2">
        {menuItems.map((item) => (
          <li 
            key={item.id}
            className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
              item.id === 'user' 
              ? 'bg-blue-50 text-primary border-r-4 border-primary' 
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon && <span className="material-icons text-xl">{item.icon}</span>}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="material-icons text-xs">chevron_right</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
