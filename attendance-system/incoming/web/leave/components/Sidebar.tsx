
import React from 'react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 h-full">
      <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-grow">
        <div>
          <button className="w-full flex items-center justify-between p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all group">
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-xl">settings</span>
              <span className="font-medium">考勤配置</span>
            </div>
            <span className="material-icons-round text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
          </button>
        </div>
        
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between p-3 text-primary bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-all">
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-xl">pending_actions</span>
              <span className="font-semibold">考勤处理</span>
            </div>
            <span className="material-icons-round text-sm">expand_more</span>
          </button>
          <div className="pl-12 space-y-1 py-1 text-sm">
            <a className="block p-2 text-primary font-medium border-l-2 border-primary pl-4 bg-primary/5 dark:bg-primary/10" href="#">请假处理</a>
            <a className="block p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary pl-4 transition-colors" href="#">补签处理</a>
            <a className="block p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary pl-4 transition-colors" href="#">补签记录</a>
          </div>
        </div>
        
        <div>
          <button className="w-full flex items-center justify-between p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-all group">
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-xl">bar_chart</span>
              <span className="font-medium">考勤统计</span>
            </div>
            <span className="material-icons-round text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 text-center uppercase tracking-widest">
        © 2024 宇视云 考勤系统
      </div>
    </aside>
  );
};
