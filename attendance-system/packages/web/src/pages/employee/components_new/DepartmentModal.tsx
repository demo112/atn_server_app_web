import React, { useEffect, useState } from 'react';
import { DepartmentVO, CreateDepartmentDto, UpdateDepartmentDto } from '@attendance/shared';
import { departmentService } from '../../../services/department';

interface DepartmentModalProps {
  mode: 'create' | 'edit';
  parentDepartment?: DepartmentVO | null; // For create mode
  department?: DepartmentVO | null; // For edit mode
  onClose: () => void;
  onSuccess: () => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  mode,
  parentDepartment,
  department,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && department) {
      setName(department.name);
    } else {
      setName('');
    }
  }, [mode, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        const dto: CreateDepartmentDto = {
          name: name.trim(),
          parentId: parentDepartment ? parentDepartment.id : undefined,
        };
        await departmentService.createDepartment(dto);
      } else if (mode === 'edit' && department) {
        const dto: UpdateDepartmentDto = {
          name: name.trim(),
        };
        await departmentService.updateDepartment(department.id, dto);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Failed to save department:', err);
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const title = mode === 'create' 
    ? (parentDepartment ? `在 "${parentDepartment.name}" 下新增部门` : '新增一级部门')
    : '编辑部门';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              部门名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入部门名称"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:bg-slate-700 dark:text-white sm:text-sm"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;
