import React, { useEffect, useState } from 'react';
import { departmentService } from '../../../services/department';
import { DepartmentVO } from '@attendance/shared';
import { Department } from '../types_ui';

const mapDepartment = (dept: DepartmentVO): Department => ({
  id: String(dept.id),
  name: dept.name,
  children: dept.children?.map(mapDepartment),
  isOpen: true
});

const DepartmentItem: React.FC<{ dept: Department; level?: number }> = ({ dept, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(dept.isOpen);

  return (
    <div className="">
      <div 
        className="group flex items-center px-2 py-2 rounded cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm transition-colors"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {dept.children && dept.children.length > 0 ? (
          <span className="material-icons-round text-slate-400 text-sm mr-1">
            {isOpen ? 'indeterminate_check_box' : 'add_box'}
          </span>
        ) : (
           <span className="w-4 mr-1"></span>
        )}
        <span className={`material-icons-round text-sm mr-1 ${level === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
          {level === 0 ? 'folder_open' : 'account_tree'}
        </span>
        <span className="flex-1 truncate text-slate-700 dark:text-slate-300">{dept.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 ml-2 transition-opacity" onClick={e => e.stopPropagation()}>
          <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary" title="添加子部门">
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-primary" title="编辑部门">
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          {level > 0 && (
            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-red-500" title="删除部门">
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          )}
        </div>
      </div>
      
      {isOpen && dept.children && (
        <div className="border-l border-slate-200 dark:border-slate-700 ml-4 pl-0">
          {dept.children.map(child => (
            <DepartmentItem key={child.id} dept={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const DepartmentSidebar: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const tree = await departmentService.getTree();
        setDepartments(tree.map(mapDepartment));
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

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
        {loading ? (
          <div className="flex justify-center py-4 text-slate-400 text-sm">加载中...</div>
        ) : (
          departments.map(dept => (
            <DepartmentItem key={dept.id} dept={dept} />
          ))
        )}
      </div>
    </aside>
  );
};

export default DepartmentSidebar;
