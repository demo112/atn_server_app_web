import React, { useState, useEffect } from 'react';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeVo } from '@attendance/shared';
import dayjs from 'dayjs';
import { useToast } from '@/components/common/ToastProvider';
import StandardModal from '@/components/common/StandardModal';

interface EmployeeModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: EmployeeVo | null;
  onCancel: () => void;
  onOk: (values: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>;
  confirmLoading?: boolean;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open,
  mode,
  initialValues,
  onCancel,
  onOk,
  confirmLoading,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (open) {
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
          deptId: '',
          phone: '',
          email: '',
          hireDate: '',
        });
      }
    }
  }, [open, mode, initialValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'deptId' ? (value ? Number(value) : '') : value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (mode === 'create' && !formData.employeeNo) {
        toast.error('Please input employee no!');
        return;
      }
      if (!formData.name) {
        toast.error('Please input name!');
        return;
      }
      if (!formData.deptId) {
        toast.error('Please select department!');
        return;
      }
      if (!formData.hireDate) {
        toast.error('Please select hire date!');
        return;
      }

      setLoading(true);

      const values: any = {
        ...formData,
        hireDate: formData.hireDate,
      };

      if (mode === 'edit') {
        // Remove employeeNo for edit mode as it might not be editable or needed
        delete values.employeeNo;
      }

      await onOk(values);
    } catch (error) {
      toast.error('Submit Failed');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        取消
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading || confirmLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading || confirmLoading ? '提交中...' : '确定'}
      </button>
    </div>
  );

  return (
    <StandardModal
      isOpen={open}
      onClose={onCancel}
      title={mode === 'create' ? 'Add Employee' : 'Edit Employee'}
      footer={footer}
      width="max-w-md"
    >
      <div className="space-y-4">
        {mode === 'create' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employeeNo"
              value={formData.employeeNo}
              onChange={handleInputChange}
              placeholder="E.g. E001"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Employee Name"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="deptId"
            value={formData.deptId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          >
            <option value="">Select Department</option>
            <option value={1}>总经办</option>
            <option value={3}>研发部-后端组</option>
            <option value={4}>研发部-前端组</option>
            <option value={5}>人事部</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hire Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="hireDate"
            value={formData.hireDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          />
        </div>
      </div>
    </StandardModal>
  );
};
