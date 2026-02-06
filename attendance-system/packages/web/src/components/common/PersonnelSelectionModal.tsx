import React, { useState, useEffect, useMemo } from 'react';
import StandardModal from './StandardModal';
import { DepartmentTree } from './DepartmentTree';
import { employeeService } from '@/services/employee';
import { EmployeeVo, DepartmentVO } from '@attendance/shared';
import { useToast } from './ToastProvider';

export type SelectionType = 'employee' | 'department' | 'all';

export interface SelectionItem {
  id: number | string;
  name: string;
  type: 'employee' | 'department';
  data?: any;
}

interface PersonnelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: SelectionItem[]) => void;
  title?: string;
  multiple?: boolean;
  selectType?: SelectionType; // default 'all'
  initialSelected?: SelectionItem[];
}

export const PersonnelSelectionModal: React.FC<PersonnelSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '选择人员',
  multiple = true,
  selectType = 'all',
  initialSelected = [],
}) => {
  const { toast } = useToast();

  // Left: Department Tree selection
  const [activeDeptId, setActiveDeptId] = useState<number | null>(null);

  // Middle: Employee List
  const [employees, setEmployees] = useState<EmployeeVo[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Right: Selected Items
  const [selectedItems, setSelectedItems] = useState<SelectionItem[]>(initialSelected);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedItems(initialSelected);
      setActiveDeptId(null);
      setSearchName('');
      setEmployees([]);
    }
  }, [isOpen, initialSelected]);

  // Load employees when dept changes or search
  useEffect(() => {
    if (!isOpen) return;
    if (selectType === 'department') return; // If only selecting departments, no need to load employees

    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const params: any = {
          page: 1,
          pageSize: 1000,
        };
        if (activeDeptId && activeDeptId !== -1) {
          params.deptId = activeDeptId;
        }
        if (searchName) {
          params.name = searchName;
        }

        // Optimize: Don't load if no filter (unless we want to show all)
        // Let's show all if "All Company" (-1) is selected or nothing selected
        const res = await employeeService.getEmployees(params);
        setEmployees(res.items);
      } catch (err) {
        console.error(err);
        toast.error('加载人员失败');
      } finally {
        setLoadingEmployees(false);
      }
    };

    // Debounce search? For now direct call
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, activeDeptId, searchName, selectType]);

  const handleDeptSelect = (deptId: number | null) => {
    setActiveDeptId(deptId);
  };

  const handleDeptNodeSelect = (node: DepartmentVO | null) => {
    // 如果是选择部门模式，点击树节点直接选中该部门
    if (selectType === 'department' && node && node.id !== -1) {
       const item: SelectionItem = {
         id: node.id,
         name: node.name,
         type: 'department',
         data: node
       };

       if (!multiple) {
          setSelectedItems([item]);
       } else {
          const exists = selectedItems.find(i => i.id === item.id && i.type === item.type);
          if (exists) {
            setSelectedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
          } else {
            setSelectedItems(prev => [...prev, item]);
          }
       }
    }
  };

  // Toggle item selection
  const toggleSelection = (item: SelectionItem) => {
    if (!multiple) {
      setSelectedItems([item]);
      return;
    }

    const exists = selectedItems.find(i => i.id === item.id && i.type === item.type);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const isSelected = (id: number | string, type: 'employee' | 'department') => {
    return selectedItems.some(i => i.id === id && i.type === type);
  };

  const handleConfirm = () => {
    onConfirm(selectedItems);
    onClose();
  };

  // If selectType is department, we might want to capture tree selection differently
  // Or render checkboxes in tree.
  // For simplicity, if selectType is department, we assume clicking tree node *selects* it if single mode?
  // Let's keep it consistent: Left is filter, Middle is list.
  // But for departments, there is no "list".
  // Special case: selectType === 'department'

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width="max-w-5xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-500">
            已选择 {selectedItems.length} 项
          </div>
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              确定
            </button>
          </div>
        </div>
      }
    >
      <div className="flex h-[500px] border border-gray-200 rounded-lg overflow-hidden">
        {/* Left: Department Tree */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-3 border-b border-gray-200 font-medium text-gray-700 bg-gray-100">
            组织架构
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <DepartmentTree 
              onSelect={handleDeptSelect} 
              onNodeSelect={handleDeptNodeSelect}
              selectedId={activeDeptId} 
            />
          </div>
          {/* If selecting departments, allow adding current dept */}
          {(selectType === 'all') && activeDeptId && activeDeptId !== -1 && (
            <div className="p-3 border-t border-gray-200 bg-white text-center">
              <button
                onClick={() => {
                  // We need dept name here. DepartmentTree doesn't expose it easily up.
                  // This is a limitation of current DepartmentTree.
                  // Ideally DepartmentTree should pass node back.
                  // For now, let's skip "Select Department" button here to avoid complexity without name.
                  // User can select employees.
                  // TODO: Enhance DepartmentTree to pass full node.
                  toast.info('请在右侧选择');
                }}
                className="text-sm text-primary hover:underline"
              >
                选中当前部门 (开发中)
              </button>
            </div>
          )}
        </div>

        {/* Middle: Selection Area */}
        <div className="flex-1 flex flex-col border-r border-gray-200">
          <div className="p-3 border-b border-gray-200 flex gap-2 bg-white">
            <div className="relative flex-1">
              <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              <input
                type="text"
                placeholder="搜索姓名..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {selectType === 'department' ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="material-icons text-4xl mb-2">domain</span>
                <p>请在左侧点击部门进行选择</p>
              </div>
            ) : (
              <>
                {loadingEmployees ? (
                  <div className="flex justify-center py-8 text-gray-400">加载中...</div>
                ) : employees.length === 0 ? (
                  <div className="flex justify-center py-8 text-gray-400">暂无数据</div>
                ) : (
                  <div className="space-y-1">
                    {employees.map(emp => {
                      const checked = isSelected(emp.id, 'employee');
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleSelection({ 
                            id: emp.id, 
                            name: emp.name, 
                            type: 'employee',
                            data: emp 
                          })}
                          className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                            checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${
                            checked ? 'bg-primary border-primary' : 'border-gray-300 bg-white'
                          }`}>
                            {checked && <span className="material-icons text-white text-[10px] font-bold">check</span>}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-500">{emp.employeeNo}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Selected List */}
        <div className="w-1/4 flex flex-col bg-gray-50">
          <div className="p-3 border-b border-gray-200 font-medium text-gray-700 bg-gray-100 flex justify-between items-center">
            <span>已选人员</span>
            <button 
              onClick={() => setSelectedItems([])}
              className="text-xs text-red-500 hover:text-red-700"
            >
              清空
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {selectedItems.map((item, idx) => (
              <div key={`${item.type}-${item.id}`} className="bg-white p-2 rounded border border-gray-200 shadow-sm flex justify-between items-center group">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-icons text-gray-400 text-sm">
                    {item.type === 'department' ? 'domain' : 'person'}
                  </span>
                  <span className="text-sm truncate">{item.name}</span>
                </div>
                <button
                  onClick={() => toggleSelection(item)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StandardModal>
  );
};

export default PersonnelSelectionModal;
