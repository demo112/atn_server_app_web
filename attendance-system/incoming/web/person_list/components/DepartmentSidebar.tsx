
import React from 'react';

const DepartmentSidebar: React.FC = () => {
  return (
    <aside className="w-72 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <h3 className="text-sm font-semibold mb-3">部门</h3>
        <div className="relative mb-3">
          <input 
            className="w-full pl-8 pr-3 py-1.5 text-sm border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded focus:ring-primary focus:border-primary dark:text-white" 
            placeholder="请输入关键字" 
            type="text"
          />
          <span className="material-icons-round absolute left-2 top-2 text-slate-400 text-sm">search</span>
        </div>
        <label className="flex items-center space-x-2 text-xs text-slate-500 cursor-pointer">
          <input className="rounded text-primary focus:ring-primary border-slate-300 w-3.5 h-3.5" type="checkbox"/>
          <span>显示子部门成员</span>
        </label>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <div className="group flex items-center px-2 py-2 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm">
          <span className="material-icons-round text-slate-400 text-sm mr-1">indeterminate_check_box</span>
          <span className="material-icons-round text-amber-500 text-sm mr-1">folder_open</span>
          <span className="flex-1 truncate text-slate-700 dark:text-slate-300">atnd01_dev的宇视云</span>
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 ml-2 transition-opacity">
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[16px]">add</span></button>
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-[16px]">delete</span></button>
          </div>
        </div>
        
        <div className="ml-4 border-l border-slate-200 dark:border-slate-700 mt-0.5 pl-2">
          {['技术部', '行政部'].map(dept => (
            <div key={dept} className="group flex items-center px-2 py-2 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm">
              <span className="material-symbols-outlined text-slate-400 mr-2 !text-[18px]">account_tree</span>
              <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{dept}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 ml-2 transition-opacity">
                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[16px]">add</span></button>
                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-[16px]">delete</span></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default DepartmentSidebar;
