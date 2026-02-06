import React, { useState, useEffect, useMemo } from 'react';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeVo, DepartmentVO } from '@attendance/shared';
import dayjs from 'dayjs';
import { useToast } from '@/components/common/ToastProvider';
import { departmentService } from '@/services/department';
import PersonnelSelectionModal from '@/components/common/PersonnelSelectionModal';

interface EmployeeModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: EmployeeVo | null;
  defaultDeptId?: number;
  onCancel: () => void;
  onOk: (values: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>;
  confirmLoading?: boolean;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open,
  mode,
  initialValues,
  defaultDeptId,
  onCancel,
  onOk,
  confirmLoading,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentVO[]>([]);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    employeeNo: string;
    name: string;
    deptId: number | '';
    phone: string;
    email: string;
    hireDate: string;
  }>({
    employeeNo: '',
    name: '',
    deptId: '',
    phone: '',
    email: '',
    hireDate: '',
  });

  const departmentOptions = useMemo(() => {
    const flatten = (depts: DepartmentVO[], level = 0, result: { id: number, name: string, level: number }[] = []) => {
      depts.forEach(dept => {
        result.push({ id: dept.id, name: dept.name, level });
        if (dept.children && dept.children.length > 0) {
          flatten(dept.children, level + 1, result);
        }
      });
      return result;
    };
    return flatten(departments);
  }, [departments]);

  useEffect(() => {
    if (open) {
      const fetchDepartments = async () => {
        try {
          const tree = await departmentService.getTree();
          setDepartments(tree);
          
          if (mode === 'create' && !defaultDeptId && tree.length > 0) {
            setFormData(prev => ({
              ...prev,
              deptId: tree[0].id
            }));
          }
        } catch (error) {
          console.error('Failed to fetch departments:', error);
        }
      };
      fetchDepartments();

      if (mode === 'edit' && initialValues) {
        setFormData({
          employeeNo: initialValues.employeeNo || '',
          name: initialValues.name || '',
          deptId: initialValues.deptId || '',
          phone: initialValues.phone || '',
          email: initialValues.email || '',
          hireDate: initialValues.hireDate ? dayjs(initialValues.hireDate).format('YYYY-MM-DD') : '',
        });
      } else {
        setFormData({
          employeeNo: '',
          name: '',
          deptId: defaultDeptId || '',
          phone: '',
          email: '',
          hireDate: '',
        });
      }
    }
  }, [open, mode, initialValues, defaultDeptId]);

  // Removed effectiveDefaultDeptId

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deptId' ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'create' && !formData.employeeNo) {
        toast.error('请输入工号！');
        return;
      }
      if (!formData.name) {
        toast.error('请输入姓名！');
        return;
      }
      if (!formData.deptId) {
        toast.error('请选择部门！');
        return;
      }
      if (!formData.hireDate) {
        toast.error('请选择入职日期！');
        return;
      }

      setLoading(true);

      const values: any = {
        ...formData,
        hireDate: formData.hireDate,
      };

      if (mode === 'edit') {
        delete values.employeeNo;
      }

      await onOk(values);
    } catch (error) {
      toast.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-3 bg-[#409eff] flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">
            {mode === 'create' ? '添加人员' : '编辑人员'}
          </h3>
          <button 
            onClick={onCancel}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors focus:outline-none flex items-center justify-center"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                工号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employeeNo"
                value={formData.employeeNo}
                onChange={handleInputChange}
                placeholder="例如: E001"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入姓名"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              部门 <span className="text-red-500">*</span>
            </label>
            <div 
              onClick={() => setIsDeptModalOpen(true)}
              className="relative cursor-pointer"
            >
              <input
                type="text"
                readOnly
                placeholder="请选择部门"
                value={formData.deptId ? departmentOptions.find(d => d.id === formData.deptId)?.name || '' : ''}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow cursor-pointer"
              />
              <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">arrow_drop_down</span>
            </div>
            
            <PersonnelSelectionModal
              isOpen={isDeptModalOpen}
              onClose={() => setIsDeptModalOpen(false)}
              onConfirm={(items) => {
                if (items.length > 0) {
                  setFormData(prev => ({ ...prev, deptId: Number(items[0].id) }));
                }
                setIsDeptModalOpen(false);
              }}
              multiple={false}
              selectType="department"
              title="选择部门"
              initialSelected={formData.deptId ? [{
                id: String(formData.deptId),
                name: departmentOptions.find(d => d.id === formData.deptId)?.name || '',
                type: 'department'
              }] : []}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              手机号
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="请输入手机号"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入邮箱"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              入职日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end items-center space-x-3 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#409eff]"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || confirmLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#409eff] border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#409eff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || confirmLoading ? '提交中...' : '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};
