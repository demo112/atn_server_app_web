import React, { useState, useEffect } from 'react';
import StandardModal from '@/components/common/StandardModal';
import { DepartmentTree } from '@/components/common/DepartmentTree';
import { employeeService } from '@/services/employee';
import { EmployeeVo } from '@attendance/shared';
import { useToast } from '@/components/common/ToastProvider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employee: EmployeeVo) => void;
}

export const DepartmentUserSelectModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const { toast } = useToast();
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<EmployeeVo[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDeptId) {
      fetchEmployees(selectedDeptId);
    } else {
      setEmployees([]);
    }
  }, [selectedDeptId]);

  const fetchEmployees = async (deptId: number) => {
    setLoading(true);
    try {
      // Assuming getEmployees accepts deptId based on backend schema
      // We set page size to 100 to get most employees in a dept.
      // Ideally we should handle pagination if the dept is huge.
      const res = await employeeService.getEmployees({ deptId, page: 1, pageSize: 100 });
      setEmployees(res.items);
    } catch (err) {
      console.error(err);
      toast.error('获取人员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedEmployeeId) {
      toast.warning('请选择一个人员');
      return;
    }
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (emp) {
      onSelect(emp);
      onClose();
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        取消
      </button>
      <button
        onClick={handleConfirm}
        disabled={!selectedEmployeeId}
        className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        确定
      </button>
    </div>
  );

  return (
    <StandardModal
      title="选择人员"
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <div className="flex h-96 gap-4">
        {/* Left: Department Tree */}
        <div className="w-1/3 h-full flex flex-col">
          <DepartmentTree onSelect={setSelectedDeptId} selectedId={selectedDeptId} />
        </div>
        
        {/* Right: Employee List */}
        <div className="w-2/3 h-full border border-gray-200 rounded-lg bg-white flex flex-col">
          <div className="p-3 border-b border-gray-100 bg-gray-50 font-medium text-gray-700 text-sm">
            人员列表 {selectedDeptId ? '' : '(请先选择部门)'}
          </div>
          <div className="flex-1 overflow-auto p-2">
            {loading ? (
               <div className="flex items-center justify-center h-full text-gray-400 text-sm">加载中...</div>
            ) : employees.length > 0 ? (
              <ul className="space-y-1">
                {employees.map(emp => (
                  <li 
                    key={emp.id}
                    className={`px-3 py-2 rounded-md cursor-pointer text-sm flex items-center justify-between transition-colors ${
                      selectedEmployeeId === emp.id 
                        ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    onDoubleClick={() => {
                      setSelectedEmployeeId(emp.id);
                      onSelect(emp);
                      onClose();
                    }}
                  >
                    <span>{emp.name}</span>
                    <span className="text-gray-400 text-xs">{emp.employeeNo}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                {selectedDeptId ? '该部门暂无人员' : '请在左侧选择部门'}
              </div>
            )}
          </div>
        </div>
      </div>
    </StandardModal>
  );
};
