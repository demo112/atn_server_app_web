
import React from 'react';
import { MenuKey, SubMenuKey } from '../types';

interface MainSidebarProps {
  activeMenu: MenuKey;
  activeSubMenu: SubMenuKey;
  onMenuChange: (menu: MenuKey) => void;
  onSubMenuChange: (subMenu: SubMenuKey) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ 
  activeMenu, 
  activeSubMenu, 
  onMenuChange, 
  onSubMenuChange 
}) => {
  return (
    <aside className="w-60 border-r border-slate-200 bg-white p-4 shrink-0 h-full overflow-y-auto">
      <div className="space-y-1">
        <button 
          onClick={() => onMenuChange('config')}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors group ${
            activeMenu === 'config' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-xl ${activeMenu === 'config' ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>settings</span>
            <span className="text-sm font-medium">考勤配置</span>
          </div>
          <span className="material-symbols-outlined text-lg text-slate-300">chevron_right</span>
        </button>

        <div className="pt-1">
          <button 
            onClick={() => onMenuChange('process')}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${
              activeMenu === 'process' ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined text-xl ${activeMenu === 'process' ? 'text-primary' : 'text-slate-400'}`}>assignment</span>
              <span className="text-sm font-medium">考勤处理</span>
            </div>
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          
          <div className="mt-1 ml-9 space-y-1">
            {[
              { id: 'leave', label: '请假处理' },
              { id: 'overtime', label: '补签处理' },
              { id: 'correction', label: '补签记录' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => onSubMenuChange(sub.id as SubMenuKey)}
                className={`block w-full text-left p-2 text-sm transition-colors rounded-md ${
                  activeSubMenu === sub.id 
                    ? 'text-primary font-medium' 
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onMenuChange('stats')}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg mt-1 transition-colors group ${
            activeMenu === 'stats' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-xl ${activeMenu === 'stats' ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`}>bar_chart</span>
            <span className="text-sm font-medium">考勤统计</span>
          </div>
          <span className="material-symbols-outlined text-lg text-slate-300">chevron_right</span>
        </button>
      </div>
    </aside>
  );
};

export default MainSidebar;
