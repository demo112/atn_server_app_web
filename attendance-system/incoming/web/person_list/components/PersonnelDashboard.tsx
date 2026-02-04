
import React, { useState } from 'react';
import { Person, FilterParams } from '../types';

interface Props {
  data: Person[];
  onFilterChange: (filters: FilterParams) => void;
  onDelete: (id: string) => void;
}

const PersonnelDashboard: React.FC<Props> = ({ data, onFilterChange, onDelete }) => {
  const [localFilters, setLocalFilters] = useState<FilterParams>({ name: '', idNumber: '', status: 'all' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSearch = () => onFilterChange(localFilters);
  const handleReset = () => {
    const defaultFilters: FilterParams = { name: '', idNumber: '', status: 'all' };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Search Header */}
      <section className="p-4 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">姓名:</label>
            <input 
              value={localFilters.name}
              onChange={e => setLocalFilters({ ...localFilters, name: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded focus:ring-primary focus:border-primary" 
              type="text" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">证件号码:</label>
            <input 
              value={localFilters.idNumber}
              onChange={e => setLocalFilters({ ...localFilters, idNumber: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded focus:ring-primary focus:border-primary" 
              type="text" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 dark:text-slate-400">状态:</label>
            <select 
              value={localFilters.status}
              onChange={e => setLocalFilters({ ...localFilters, status: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded focus:ring-primary focus:border-primary appearance-none"
            >
              <option value="all">请选择</option>
              <option value="active">在职</option>
              <option value="inactive">离职</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleSearch}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-1.5 rounded text-sm transition font-medium shadow-sm active:scale-95"
            >
              查询
            </button>
            <button 
              onClick={handleReset}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-6 py-1.5 rounded text-sm transition text-slate-600 dark:text-slate-300"
            >
              重置
            </button>
          </div>
        </div>
      </section>

      {/* Action Toolbar */}
      <section className="p-3 flex flex-wrap gap-2 items-center bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
        <button className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded text-sm transition text-slate-700 dark:text-slate-300">
          <span className="material-icons-round text-blue-500 text-base">add</span>
          <span>添加</span>
        </button>
        <button 
          disabled={selectedIds.size === 0}
          className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded text-sm transition text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-icons-round text-red-500 text-base">delete_outline</span>
          <span>删除</span>
        </button>
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded text-sm transition text-slate-700 dark:text-slate-300">
          <span className="material-icons-round text-slate-500 text-base">swap_horiz</span>
          <span>更换部门</span>
        </button>
        {/* "同步设备人员" button removed as requested */}
        <button className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded text-sm transition text-slate-700 dark:text-slate-300">
          <span className="material-icons-round text-slate-500 text-base">file_download</span>
          <span>导入</span>
          <span className="material-icons-round text-xs">expand_more</span>
        </button>
        <button className="flex items-center space-x-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded text-sm transition text-slate-700 dark:text-slate-300">
          <span className="material-icons-round text-slate-500 text-base">file_upload</span>
          <span>导出人员</span>
        </button>
      </section>

      {/* Table Area */}
      <section className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10 border-b border-border-light dark:border-border-dark">
            <tr>
              <th className="p-3 w-10 text-center">
                <input 
                  onChange={toggleSelectAll}
                  checked={data.length > 0 && selectedIds.size === data.length}
                  className="rounded text-primary focus:ring-primary border-slate-300 w-4 h-4" 
                  type="checkbox"
                />
              </th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">工号</th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">姓名</th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">联系方式</th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">性别</th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">部门</th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">证件类型</th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400">证件号码</th>
              <th className="p-3 font-semibold text-slate-600 dark:text-slate-400 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark bg-card-light dark:bg-card-dark">
            {data.length > 0 ? (
              data.map(person => (
                <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-3 text-center">
                    <input 
                      checked={selectedIds.has(person.id)}
                      onChange={() => toggleSelect(person.id)}
                      className="rounded text-primary focus:ring-primary border-slate-300 w-4 h-4" 
                      type="checkbox"
                    />
                  </td>
                  <td className="p-3">{person.id}</td>
                  <td className="p-3 font-medium">{person.name}</td>
                  <td className="p-3">{person.contact}</td>
                  <td className="p-3 text-slate-500">{person.gender === 'Unknown' ? '未知' : person.gender}</td>
                  <td className="p-3 max-w-[200px] truncate" title={person.department}>{person.department}</td>
                  <td className="p-3">{person.idType}</td>
                  <td className="p-3">{person.idNumber}</td>
                  <td className="p-3">
                    <div className="flex justify-center space-x-3">
                      <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-icons-round text-lg">edit</span></button>
                      <button 
                        onClick={() => onDelete(person.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-icons-round text-lg">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 italic">未找到相关人员数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Pagination Footer */}
      <footer className="p-3 flex items-center justify-end space-x-4 bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark text-sm flex-shrink-0">
        <span className="text-slate-500">共 {data.length} 条</span>
        <div className="flex items-center space-x-1">
          <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed">
            <span className="material-icons-round">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-primary bg-primary text-white rounded shadow-sm">1</button>
          <button className="w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500">
            <span className="material-icons-round">chevron_right</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select className="px-2 py-1 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded text-xs focus:ring-primary focus:border-primary">
            <option>20条/页</option>
            <option>50条/页</option>
            <option>100条/页</option>
          </select>
          <span className="text-slate-500">跳至</span>
          <input className="w-10 px-1 py-1 text-center border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded text-xs focus:ring-primary" type="text" defaultValue="1" />
          <span className="text-slate-500">页</span>
        </div>
      </footer>
    </main>
  );
};

export default PersonnelDashboard;
