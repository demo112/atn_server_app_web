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
    <div className="select-none">
      <div 
        className={`group flex items-center px-2 py-1.5 rounded cursor-pointer text-sm transition-colors mb-0.5 ${
          isSelected 
            ? 'bg-blue-50 text-blue-600 font-medium' 
            : 'hover:bg-gray-50 text-gray-600'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleItemClick}
      >
        <div onClick={handleExpandClick} className="flex items-center cursor-pointer p-0.5 rounded hover:bg-black/5 mr-1">
          {dept.children && dept.children.length > 0 ? (
            <span className={`material-icons text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
              chevron_right
            </span>
          ) : (
             <span className="w-4"></span>
          )}
        </div>
        
        <span className={`material-icons text-sm mr-2 ${level === 0 ? 'text-blue-500' : (isSelected ? 'text-blue-500' : 'text-gray-400')}`}>
          {level === 0 ? 'corporate_fare' : 'folder'}
        </span>
        <span className="flex-1 truncate">{dept.name}</span>
        
        <div className="opacity-0 group-hover:opacity-100 flex items-center ml-2 transition-opacity">
          <button 
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-blue-500 transition-colors" 
            title="添加子部门"
            onClick={(e) => { e.stopPropagation(); onAdd(dept); }}
          >
            <span className="material-icons text-[14px]">add</span>
          </button>
          <button 
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-blue-500 transition-colors" 
            title="编辑部门"
            onClick={(e) => { e.stopPropagation(); onEdit(dept); }}
          >
            <span className="material-icons text-[14px]">edit</span>
          </button>
          <button 
            className="p-1 hover:bg-white rounded text-gray-400 hover:text-red-500 transition-colors" 
            title="删除部门"
            onClick={(e) => { e.stopPropagation(); onDelete(dept); }}
          >
            <span className="material-icons text-[14px]">delete</span>
          </button>
        </div>
      </div>
      
      {isOpen && dept.children && (
        <div className="">
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
  
  // Search state
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<Department[]>([]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const tree = await departmentService.getTree();
      setDepartments(tree.map(mapDepartment));
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Default select the root if available
  useEffect(() => {
    if (departments.length > 0 && !selectedId) {
      const rootId = departments[0].id;
      setSelectedId(rootId);
      if (onSelect) onSelect(rootId);
    }
  }, [departments, selectedId, onSelect]);

  // Search effect
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    const flatten = (nodes: Department[]): Department[] => {
      let res: Department[] = [];
      for (const node of nodes) {
        res.push(node);
        if (node.children) {
          res = res.concat(flatten(node.children));
        }
      }
      return res;
    };

    const all = flatten(departments);
    const filtered = all.filter(d => d.name.toLowerCase().includes(searchText.toLowerCase()));
    setSearchResults(filtered);
  }, [searchText, departments]);

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
        // If deleted department was selected, select root
        if (selectedId === dept.id) {
          setSelectedId('');
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
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700">部门架构</h3>
          <button 
            className="p-1 hover:bg-blue-50 text-blue-500 rounded transition-colors"
            onClick={handleAddRoot}
            title="添加根部门"
          >
            <span className="material-icons text-sm">add</span>
          </button>
        </div>
        
        <div className="relative">
          <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input 
            className="w-full text-xs border border-gray-300 rounded pl-8 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
            placeholder="搜索部门" 
            type="text" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        ) : searchText ? (
          // Search Results
          <div className="space-y-1">
            {searchResults.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-4">无匹配结果</div>
            ) : (
              searchResults.map(dept => (
                <div 
                  key={dept.id}
                  className={`flex items-center px-3 py-2 rounded cursor-pointer text-sm transition-colors ${
                    selectedId === dept.id 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  onClick={() => handleSelect(dept)}
                >
                  <span className="material-icons text-sm mr-2 text-gray-400">folder</span>
                  <span className="flex-1 truncate">{dept.name}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          // Tree View
          <>
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
          </>
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
