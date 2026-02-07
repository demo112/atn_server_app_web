import React, { useEffect, useState, useCallback } from 'react';
import { departmentService } from '../../../services/department';
import { DepartmentVO } from '@attendance/shared';
import StandardModal from '../../../components/common/StandardModal';
import { toast } from '../../../providers/ToastProvider';

interface DepartmentNode {
  id: string;
  name: string;
  children?: DepartmentNode[];
  isOpen?: boolean;
}

const mapDepartment = (dept: DepartmentVO): DepartmentNode => ({
  id: String(dept.id),
  name: dept.name,
  children: dept.children?.map(mapDepartment),
  isOpen: true
});

interface BatchDeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deptId: number) => Promise<void>;
  selectedCount: number;
}

const DeptTreeItem: React.FC<{
  dept: DepartmentNode;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}> = ({ dept, level, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(dept.isOpen);
  const isSelected = selectedId === dept.id;

  return (
    <div>
      <div 
        className={`flex items-center px-2 py-1.5 rounded cursor-pointer text-sm transition-colors mb-0.5 ${
          isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-600'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(dept.id)}
      >
        <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="flex items-center cursor-pointer p-0.5 mr-1">
          {dept.children && dept.children.length > 0 ? (
            <span className={`material-icons text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}>chevron_right</span>
          ) : <span className="w-4"></span>}
        </div>
        <span className="material-icons text-sm mr-2 text-blue-500">folder</span>
        <span className="truncate">{dept.name}</span>
      </div>
      {isOpen && dept.children && (
        <div>
          {dept.children.map(child => (
            <DeptTreeItem 
              key={child.id} 
              dept={child} 
              level={level + 1} 
              selectedId={selectedId} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BatchDeptModal: React.FC<BatchDeptModalProps> = ({ isOpen, onClose, onConfirm, selectedCount }) => {
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      setSelectedDeptId(null);
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const tree = await departmentService.getTree();
      setDepartments(tree.map(mapDepartment));
    } catch (error) {
      console.error(error);
      toast.error('加载部门失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedDeptId) {
      toast.warning('请选择目标部门');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(Number(selectedDeptId));
      onClose();
    } catch (error) {
      // Error handled by caller usually, but safe to log
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="批量更换部门"
      footer={
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
          <button 
            onClick={handleConfirm} 
            disabled={!selectedDeptId || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '处理中...' : '确定'}
          </button>
        </div>
      }
    >
      <div className="p-4">
        <p className="mb-4 text-gray-600">
          正在为 <span className="font-bold text-blue-600">{selectedCount}</span> 名员工更换部门，请选择新部门：
        </p>
        <div className="border rounded-md max-h-60 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center py-4 text-gray-500">加载中...</div>
          ) : (
            departments.map(dept => (
              <DeptTreeItem 
                key={dept.id} 
                dept={dept} 
                level={0} 
                selectedId={selectedDeptId} 
                onSelect={setSelectedDeptId} 
              />
            ))
          )}
        </div>
      </div>
    </StandardModal>
  );
};

export default BatchDeptModal;
