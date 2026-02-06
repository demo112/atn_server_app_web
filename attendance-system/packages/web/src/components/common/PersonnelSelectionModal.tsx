import React, { useState, useEffect, useCallback } from 'react';
import { DepartmentVO, EmployeeVo } from '@attendance/shared';
import { departmentService } from '@/services/department';
import { employeeService } from '@/services/employee';
import { useToast } from '@/components/common/ToastProvider';

export interface SelectionItem {
  id: string | number;
  name: string;
  type: 'department' | 'employee';
  data?: DepartmentVO | EmployeeVo;
}

interface PersonnelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: SelectionItem[]) => void;
  multiple?: boolean;
  selectType?: 'employee' | 'department' | 'all'; // What can be selected
  title?: string;
  initialSelected?: SelectionItem[];
}

const TreeNode: React.FC<{
  node: DepartmentVO;
  level: number;
  selectType: 'employee' | 'department' | 'all';
  multiple: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (item: SelectionItem) => void;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  loadEmployees: (deptId: number) => Promise<void>;
  employeesByDept: Record<number, EmployeeVo[]>;
  loadingDepts: Set<number>;
}> = ({ 
  node, 
  level, 
  selectType, 
  multiple, 
  selectedIds, 
  onToggleSelect, 
  expandedIds, 
  onToggleExpand,
  loadEmployees,
  employeesByDept,
  loadingDepts
}) => {
  const isExpanded = expandedIds.has(node.id);
  const employees = employeesByDept[node.id] || [];
  const isLoading = loadingDepts.has(node.id);
  
  // Department ID string format
  const deptIdStr = `dept_${node.id}`;
  const isSelected = selectedIds.has(deptIdStr);

  const handleExpand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.id);
    if (!isExpanded && (selectType === 'employee' || selectType === 'all')) {
      await loadEmployees(node.id);
    }
  };

  const handleDeptSelect = (e: React.ChangeEvent) => {
    e.stopPropagation();
    if (selectType === 'department' || selectType === 'all') {
      onToggleSelect({
        id: node.id,
        name: node.name,
        type: 'department',
        data: node
      });
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center justify-between p-1 hover:bg-blue-50 rounded group cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleExpand}
      >
        <div className="flex items-center space-x-2 text-sm text-gray-500 overflow-hidden">
          <span className={`material-icons text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            chevron_right
          </span>
          <span className="material-icons text-sm text-[#409eff]">
            {level === 0 ? 'corporate_fare' : 'folder'}
          </span>
          <span className="truncate" title={node.name}>{node.name}</span>
        </div>
        
        {(selectType === 'department' || selectType === 'all') && (
          <div onClick={e => e.stopPropagation()}>
             <input 
              type={multiple ? "checkbox" : "radio"}
              checked={isSelected}
              onChange={() => onToggleSelect({
                id: node.id,
                name: node.name,
                type: 'department',
                data: node
              })}
              className="rounded text-[#409eff] border-gray-300 focus:ring-[#409eff] w-4 h-4 cursor-pointer" 
            />
          </div>
        )}
      </div>

      {isExpanded && (
        <div>
          {/* Sub-departments */}
          {node.children?.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectType={selectType}
              multiple={multiple}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              loadEmployees={loadEmployees}
              employeesByDept={employeesByDept}
              loadingDepts={loadingDepts}
            />
          ))}

          {/* Employees */}
          {(selectType === 'employee' || selectType === 'all') && (
            <>
              {isLoading && (
                <div className="pl-8 py-1 text-xs text-gray-400">加载中...</div>
              )}
              {!isLoading && employees.length === 0 && (!node.children || node.children.length === 0) && (
                <div className="pl-8 py-1 text-xs text-gray-400">无数据</div>
              )}
              {employees.map(emp => {
                const empIdStr = `emp_${emp.id}`;
                const isEmpSelected = selectedIds.has(empIdStr);
                return (
                  <div 
                    key={emp.id}
                    className={`flex items-center justify-between p-1 hover:bg-blue-50 rounded group cursor-pointer ${isEmpSelected ? 'bg-blue-50' : ''}`}
                    style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect({
                        id: emp.id,
                        name: emp.name,
                        type: 'employee',
                        data: emp
                      });
                    }}
                  >
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="material-icons text-sm text-gray-400">person</span>
                      <span>{emp.name}</span>
                      <span className="text-xs text-gray-400">({emp.employeeNo})</span>
                    </div>
                    <input 
                      type={multiple ? "checkbox" : "radio"}
                      checked={isEmpSelected}
                      onChange={() => {}} // Handled by div click
                      className="rounded text-[#409eff] border-gray-300 focus:ring-[#409eff] w-4 h-4" 
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const PersonnelSelectionModal: React.FC<PersonnelSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  multiple = true,
  selectType = 'employee',
  title,
  initialSelected = []
}) => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<DepartmentVO[]>([]);
  const [employeesByDept, setEmployeesByDept] = useState<Record<number, EmployeeVo[]>>({});
  const [loadingDepts, setLoadingDepts] = useState<Set<number>>(new Set());
  
  // Selection State
  // We use a Map to store full item details: key -> Item
  // Keys: 'dept_1', 'emp_2'
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectionItem>>(new Map());
  
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SelectionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search Effect
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (selectType === 'employee') {
          const res = await employeeService.getEmployees({ 
            keyword: searchText, 
            page: 1, 
            pageSize: 20 
          });
          setSearchResults(res.items.map(emp => ({
            id: emp.id,
            name: emp.name,
            type: 'employee',
            data: emp
          })));
        } else {
          // Flatten and filter departments locally
          const flatten = (nodes: DepartmentVO[]): DepartmentVO[] => {
            let res: DepartmentVO[] = [];
            for (const node of nodes) {
              res.push(node);
              if (node.children) {
                res = res.concat(flatten(node.children));
              }
            }
            return res;
          };
          
          const allDepts = flatten(departments);
          const filtered = allDepts.filter(d => d.name.toLowerCase().includes(searchText.toLowerCase()));
          setSearchResults(filtered.map(d => ({
            id: d.id,
            name: d.name,
            type: 'department',
            data: d
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, selectType, departments]);

  // Initialize selection
  useEffect(() => {
    if (isOpen) {
      const map = new Map<string, SelectionItem>();
      initialSelected.forEach(item => {
        const key = item.type === 'department' ? `dept_${item.id}` : `emp_${item.id}`;
        map.set(key, item);
      });
      setSelectedItems(map);
    }
  }, [isOpen, initialSelected]);

  // Load Department Tree
  useEffect(() => {
    if (isOpen && departments.length === 0) {
      loadDepartments();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      const tree = await departmentService.getTree();
      // Add Virtual Root if needed, or just use the tree
      // The mock used '公司总部' as a root. Let's wrap if the API returns a list of roots.
      // Assuming getTree returns top level nodes.
      const root: DepartmentVO = {
        id: -1,
        name: '公司总部',
        children: tree,
        parentId: null,
        sortOrder: 0,
        createdAt: '',
        updatedAt: ''
      };
      setDepartments([root]);
      setExpandedIds(new Set([-1])); // Auto expand root
    } catch (err) {
      console.error(err);
      toast.error('加载部门数据失败');
    }
  };

  const loadEmployees = async (deptId: number) => {
    if (employeesByDept[deptId] || deptId === -1) return; // Already loaded or root
    
    setLoadingDepts(prev => new Set(prev).add(deptId));
    try {
      const res = await employeeService.getEmployees({ deptId, page: 1, pageSize: 1000 });
      setEmployeesByDept(prev => ({
        ...prev,
        [deptId]: res.items
      }));
    } catch (err) {
      console.error(err);
      toast.error('加载人员失败');
    } finally {
      setLoadingDepts(prev => {
        const next = new Set(prev);
        next.delete(deptId);
        return next;
      });
    }
  };

  const handleToggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelect = (item: SelectionItem) => {
    const key = item.type === 'department' ? `dept_${item.id}` : `emp_${item.id}`;
    
    setSelectedItems(prev => {
      const next = new Map(prev);
      if (!multiple) {
        next.clear();
        next.set(key, item);
      } else {
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.set(key, item);
        }
      }
      return next;
    });
  };

  const handleRemove = (key: string) => {
    setSelectedItems(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const handleClear = () => {
    setSelectedItems(new Map());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedItems.values()));
    onClose();
  };

  if (!isOpen) return null;

  const displayTitle = title || (selectType === 'employee' ? '选择人员' : '选择部门');

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#409eff] px-4 py-3 text-white flex justify-between items-center shrink-0">
          <span className="font-bold text-sm tracking-wide uppercase">{displayTitle}</span>
          <button 
            className="material-icons text-xl hover:bg-white/10 rounded-full transition" 
            onClick={onClose}
          >
            close
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded flex-1 min-h-0 overflow-hidden">
            {/* Left Panel: Search & Tree */}
            <div className="p-4 border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="mb-4 relative shrink-0">
                <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input 
                  className="w-full text-xs border-gray-200 rounded pl-8 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder={selectType === 'employee' ? "搜索人员" : "搜索部门"}
                  type="text" 
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                {searchText ? (
                  <div className="space-y-1">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400 text-xs">搜索中...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-xs">无匹配结果</div>
                    ) : (
                      searchResults.map(item => {
                        const key = item.type === 'department' ? `dept_${item.id}` : `emp_${item.id}`;
                        const isSelected = selectedItems.has(key);
                        return (
                          <div 
                            key={key}
                            className={`flex items-center justify-between p-2 hover:bg-blue-50 rounded cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => handleToggleSelect(item)}
                          >
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span className="material-icons text-sm text-gray-400">
                                {item.type === 'department' ? 'folder' : 'person'}
                              </span>
                              <span>{item.name}</span>
                              {item.type === 'employee' && (item.data as any).employeeNo && (
                                <span className="text-xs text-gray-400">({(item.data as any).employeeNo})</span>
                              )}
                            </div>
                            <input 
                              type={multiple ? "checkbox" : "radio"}
                              checked={isSelected}
                              onChange={() => {}} 
                              className="rounded text-[#409eff] border-gray-300 focus:ring-[#409eff] w-4 h-4" 
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  departments.map(dept => (
                    <TreeNode
                      key={dept.id}
                      node={dept}
                      level={0}
                      selectType={selectType}
                      multiple={multiple}
                      selectedIds={new Set(selectedItems.keys())}
                      onToggleSelect={handleToggleSelect}
                      expandedIds={expandedIds}
                      onToggleExpand={handleToggleExpand}
                      loadEmployees={loadEmployees}
                      employeesByDept={employeesByDept}
                      loadingDepts={loadingDepts}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Panel: Selected Items */}
            <div className="p-4 flex flex-col bg-gray-50 overflow-hidden">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2 shrink-0">
                <span className="text-xs font-bold text-gray-600">已选 ({selectedItems.size})</span>
                {selectedItems.size > 0 && (
                  <button 
                    onClick={handleClear}
                    className="text-xs text-[#409eff] hover:underline"
                  >
                    清空
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {selectedItems.size === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <span className="material-icons text-4xl mb-2 opacity-20">inbox</span>
                    <span className="text-xs">
                      {selectType === 'employee' ? '暂未选择任何人员' : '暂未选择任何部门'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Array.from(selectedItems.entries()).map(([key, item]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-white rounded shadow-sm border border-gray-100 group">
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <span className="material-icons text-gray-400 text-sm">
                            {item.type === 'department' ? 'folder' : 'person'}
                          </span>
                          <span className="text-sm text-gray-700 truncate">{item.name}</span>
                        </div>
                        <button 
                          onClick={() => handleRemove(key)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-icons text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 shrink-0">
            <button 
              onClick={handleConfirm}
              className="px-8 py-2 bg-[#409eff] text-white rounded hover:bg-blue-600 transition text-sm font-medium"
            >
              确定
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
