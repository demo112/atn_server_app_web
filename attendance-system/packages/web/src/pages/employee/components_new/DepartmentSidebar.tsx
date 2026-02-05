import React, { useEffect, useState, useCallback } from 'react';
import { departmentService } from '../../../services/department';
import { DepartmentVO } from '@attendance/shared';
import { Department } from '../types_ui';
import DepartmentModal from './DepartmentModal';

const mapDepartment = (dept: DepartmentVO): Department => ({
  id: String(dept.id),
  name: dept.name,
  children: dept.children?.map(mapDepartment),
  isOpen: true
});

interface DepartmentItemProps {
  dept: Department;
  level?: number;
  selectedId?: string;
  onSelect: (dept: Department) => void;
  onAdd: (dept: Department) => void;
  onEdit: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}

const DepartmentItem: React.FC<DepartmentItemProps> = ({ 
  dept, 
  level = 0, 
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(dept.isOpen);
  const isSelected = selectedId === dept.id;

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    onSelect(dept);
  };

  return (
    <div className="">
      <div 
        className={`group flex items-center px-2 py-2 rounded cursor-pointer text-sm transition-colors ${
          isSelected 
            ? 'bg-blue-100 dark:bg-blue-900/40 text-primary font-medium' 
            : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleItemClick}
      >
        <div onClick={handleExpandClick} className="flex items-center">
          {dept.children && dept.children.length > 0 ? (
            <span className={`material-icons-round text-sm mr-1 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
              {isOpen ? 'indeterminate_check_box' : 'add_box'}
            </span>
          ) : (
             <span className="w-4 mr-1"></span>
          )}
        </div>
        
        <span className={`material-icons-round text-sm mr-1 ${level === 0 ? 'text-amber-500' : (isSelected ? 'text-primary' : 'text-slate-400')}`}>
          {level === 0 ? 'folder_open' : 'account_tree'}
        </span>
        <span className="flex-1 truncate">{dept.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 ml-2 transition-opacity">
          <button 
            className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded text-slate-400 hover:text-primary transition-colors" 
            title="添加子部门"
            onClick={(e) => { e.stopPropagation(); onAdd(dept); }}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button 
            className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded text-slate-400 hover:text-primary transition-colors" 
            title="编辑部门"
            onClick={(e) => { e.stopPropagation(); onEdit(dept); }}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button 
            className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded text-slate-400 hover:text-red-500 transition-colors" 
            title="删除部门"
            onClick={(e) => { e.stopPropagation(); onDelete(dept); }}
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
      
      {isOpen && dept.children && (
        <div className="border-l border-slate-200 dark:border-slate-700 ml-4 pl-0">
          {dept.children.map(child => (
            <DepartmentItem 
              key={child.id} 
              dept={child} 
              level={level + 1} 
              selectedId={selectedId}
              onSelect={onSelect}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DepartmentSidebarProps {
  onSelect?: (deptId: string) => void;
}

const DepartmentSidebar: React.FC<DepartmentSidebarProps> = ({ onSelect }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentDept, setCurrentDept] = useState<DepartmentVO | null>(null);
  const [parentDept, setParentDept] = useState<DepartmentVO | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const tree = await departmentService.getTree();
      setDepartments(tree.map(mapDepartment));
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSelect = (dept: Department) => {
    setSelectedId(dept.id);
    if (onSelect) {
      onSelect(dept.id);
    }
  };

  const handleAdd = (dept: Department) => {
    setParentDept({ id: Number(dept.id), name: dept.name } as DepartmentVO);
    setCurrentDept(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleAddRoot = () => {
    setParentDept(null);
    setCurrentDept(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleEdit = (dept: Department) => {
    setCurrentDept({ id: Number(dept.id), name: dept.name } as DepartmentVO);
    setParentDept(null);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleDelete = async (dept: Department) => {
    if (window.confirm(`确定要删除部门 "${dept.name}" 吗？\n注意：如果该部门下有子部门或员工，删除将失败。`)) {
      try {
        await departmentService.deleteDepartment(Number(dept.id));
        fetchDepartments();
        // If deleted department was selected, clear selection
        if (selectedId === dept.id) {
          setSelectedId('');
          if (onSelect) onSelect('');
        }
      } catch (error: any) {
        alert(error.message || '删除失败');
      }
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    fetchDepartments();
  };

  return (
    <aside className="w-72 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">部门</h3>
          <button 
            onClick={handleAddRoot}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-primary"
            title="新增一级部门"
          >
            <span className="material-icons-round text-sm">add</span>
          </button>
        </div>
        
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
          <div>
            {departments.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                暂无部门数据
              </div>
            )}
            {departments.map(dept => (
              <DepartmentItem 
                key={dept.id} 
                dept={dept} 
                selectedId={selectedId}
                onSelect={handleSelect}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {modalVisible && (
        <DepartmentModal
          mode={modalMode}
          parentDepartment={parentDept}
          department={currentDept}
          onClose={() => setModalVisible(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </aside>
  );
};

export default DepartmentSidebar;
