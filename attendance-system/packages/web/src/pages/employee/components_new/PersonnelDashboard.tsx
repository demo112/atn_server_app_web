import React, { useState } from 'react';
import { Person, FilterParams } from '../types_ui';
import PersonnelSelectionModal, { SelectionItem } from '@/components/common/PersonnelSelectionModal';
import { useToast } from '@/components/common/ToastProvider';

interface Props {
  data: Person[];
  onFilterChange: (filters: FilterParams) => void;
  onDelete: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  onAdd: () => void;
  onEdit?: (id: string) => void;
}

const PersonnelDashboard: React.FC<Props> = ({ data, onFilterChange, onDelete, onBatchDelete, onAdd, onEdit }) => {
  const { toast } = useToast();
  const [localFilters, setLocalFilters] = useState<FilterParams>({ name: '', idNumber: '', status: 'all' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Selection Modal State
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectionItem[]>([]);

  const handleSearch = () => onFilterChange(localFilters);
  const handleReset = () => {
    const defaultFilters: FilterParams = { name: '', idNumber: '', status: 'all', deptId: undefined, employeeId: undefined };
    setLocalFilters(defaultFilters);
    setSelectedItems([]);
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
    <main className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Search Header */}
      <section className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-500">选择部门或人员:</label>
            <div 
              onClick={() => setIsSelectionModalOpen(true)}
              className="relative cursor-pointer"
            >
              <input
                type="text"
                readOnly
                className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#409eff] cursor-pointer"
                placeholder="选择部门或人员"
                value={selectedItems.map(i => i.name).join(', ')}
              />
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">状态:</label>
            <select 
              value={localFilters.status}
              onChange={e => setLocalFilters({ ...localFilters, status: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border-gray-200 bg-white rounded focus:ring-[#409eff] focus:border-[#409eff] appearance-none"
            >
              <option value="all">请选择</option>
              <option value="active">在职</option>
              <option value="inactive">离职</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleSearch}
              className="bg-[#409eff] hover:bg-blue-600 text-white px-6 py-1.5 rounded text-sm transition font-medium shadow-sm active:scale-95"
            >
              查询
            </button>
            <button 
              onClick={handleReset}
              className="bg-white border border-gray-200 hover:bg-gray-50 px-6 py-1.5 rounded text-sm transition text-gray-600"
            >
              重置
            </button>
          </div>
        </div>
      </section>

      {/* Action Toolbar */}
      <section className="p-3 flex flex-wrap gap-2 items-center bg-white border-b border-gray-200">
        <button 
          onClick={onAdd}
          className="flex items-center space-x-1 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded text-sm transition text-gray-700"
        >
          <span className="material-icons text-[#409eff] text-base">add</span>
          <span>添加</span>
        </button>
        <button 
          onClick={() => onBatchDelete?.(Array.from(selectedIds))}
          disabled={selectedIds.size === 0}
          className="flex items-center space-x-1 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded text-sm transition text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-icons text-red-500 text-base">delete_outline</span>
          <span>删除</span>
        </button>
        <div className="h-6 w-px bg-gray-200 mx-1"></div>
        <button 
          onClick={() => toast.info('批量更换部门功能暂未开放')}
          className="flex items-center space-x-1 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded text-sm transition text-gray-700 opacity-70 cursor-not-allowed"
        >
          <span className="material-icons text-gray-500 text-base">swap_horiz</span>
          <span>更换部门</span>
        </button>
        <button 
          onClick={() => toast.info('导入功能暂未开放')}
          className="flex items-center space-x-1 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded text-sm transition text-gray-700 opacity-70 cursor-not-allowed"
        >
          <span className="material-icons text-gray-500 text-base">file_download</span>
          <span>导入</span>
          <span className="material-icons text-xs">expand_more</span>
        </button>
        <button 
          onClick={() => toast.info('导出功能暂未开放')}
          className="flex items-center space-x-1 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded text-sm transition text-gray-700 opacity-70 cursor-not-allowed"
        >
          <span className="material-icons text-gray-500 text-base">file_upload</span>
          <span>导出人员</span>
        </button>
      </section>

      {/* Table Area */}
      <section className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th className="p-3 w-10 text-center">
                <input 
                  onChange={toggleSelectAll}
                  checked={data.length > 0 && selectedIds.size === data.length}
                  className="rounded text-[#409eff] focus:ring-[#409eff] border-gray-300 w-4 h-4" 
                  type="checkbox"
                />
              </th>
              <th className="p-3 font-semibold text-gray-600">工号</th>
              <th className="p-3 font-semibold text-gray-600">姓名</th>
              <th className="p-3 font-semibold text-gray-600">联系方式</th>
              <th className="p-3 font-semibold text-gray-600">性别</th>
              <th className="p-3 font-semibold text-gray-600">部门</th>
              <th className="p-3 font-semibold text-gray-600">证件类型</th>
              <th className="p-3 font-semibold text-gray-600">证件号码</th>
              <th className="p-3 font-semibold text-gray-600 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.length > 0 ? (
              data.map(person => (
                <tr 
                  key={person.id} 
                  className={`transition-colors hover:bg-blue-50 ${selectedIds.has(person.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-3 text-center">
                    <input 
                      checked={selectedIds.has(person.id)}
                      onChange={() => toggleSelect(person.id)}
                      className="rounded text-[#409eff] focus:ring-[#409eff] border-gray-300 w-4 h-4" 
                      type="checkbox"
                    />
                  </td>
                  <td className="p-3">{person.employeeNo}</td>
                  <td className="p-3 font-medium text-gray-700">{person.name}</td>
                  <td className="p-3 text-gray-600">{person.contact}</td>
                  <td className="p-3 text-gray-500">{person.gender === 'Unknown' ? '未知' : person.gender}</td>
                  <td className="p-3 max-w-[200px] truncate text-gray-600" title={person.department}>{person.department}</td>
                  <td className="p-3 text-gray-600">{person.idType}</td>
                  <td className="p-3 text-gray-600">{person.idNumber}</td>
                  <td className="p-3">
                    <div className="flex justify-center space-x-3">
                      <button 
                        onClick={() => onEdit?.(person.id)}
                        className="text-gray-400 hover:text-[#409eff] transition-colors"
                      >
                        <span className="material-icons text-lg">edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(person.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <span className="material-icons text-lg">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-400 italic">未找到相关人员数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Pagination Footer */}
      <footer className="p-3 flex items-center justify-end space-x-4 bg-white border-t border-gray-200 text-sm flex-shrink-0">
        <span className="text-gray-500">共 {data.length} 条</span>
        <div className="flex items-center space-x-1">
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-gray-50 text-gray-400 cursor-not-allowed">
            <span className="material-icons">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-[#409eff] bg-[#409eff] text-white rounded shadow-sm">1</button>
          <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-500">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select className="px-2 py-1 border-gray-200 bg-white rounded text-xs focus:ring-[#409eff] focus:border-[#409eff]">
            <option>20条/页</option>
            <option>50条/页</option>
            <option>100条/页</option>
          </select>
          <span className="text-gray-500">跳至</span>
          <input className="w-10 px-1 py-1 text-center border-gray-200 bg-white rounded text-xs focus:ring-[#409eff]" type="text" defaultValue="1" />
          <span className="text-gray-500">页</span>
        </div>
      </footer>

      <PersonnelSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onConfirm={(items) => {
          setSelectedItems(items);
          setIsSelectionModalOpen(false);
          
          if (items.length > 0) {
            const item = items[0];
            if (item.type === 'department') {
              setLocalFilters(prev => ({ ...prev, deptId: Number(item.id), employeeId: undefined, name: '' }));
            } else {
              setLocalFilters(prev => ({ ...prev, employeeId: Number(item.id), deptId: undefined, name: item.name }));
            }
          } else {
            setLocalFilters(prev => ({ ...prev, deptId: undefined, employeeId: undefined, name: '' }));
          }
        }}
        multiple={false}
        selectType="all"
        title="选择部门或人员"
        initialSelected={selectedItems}
      />
    </main>
  );
};

export default PersonnelDashboard;
