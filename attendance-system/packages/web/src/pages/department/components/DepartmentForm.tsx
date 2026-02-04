
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/common/ToastProvider';
import { DepartmentVO, CreateDepartmentDto, UpdateDepartmentDto } from '@attendance/shared';
import StandardModal from '@/components/common/StandardModal';

interface DepartmentFormProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<DepartmentVO>; // For edit or create with parentId
  treeData: DepartmentVO[]; // For parent selection
  onCancel: () => void;
  onSuccess: (values: CreateDepartmentDto | UpdateDepartmentDto) => Promise<void>;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  visible,
  mode,
  initialValues,
  treeData,
  onCancel,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    sortOrder: 0,
  });

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialValues) {
        setFormData({
          name: initialValues.name || '',
          parentId: initialValues.parentId ? String(initialValues.parentId) : '',
          sortOrder: initialValues.sortOrder || 0,
        });
      } else {
        setFormData({
          name: '',
          parentId: initialValues?.parentId ? String(initialValues.parentId) : '',
          sortOrder: 0,
        });
      }
    }
  }, [visible, mode, initialValues]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('请输入部门名称');
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        name: formData.name,
        sortOrder: Number(formData.sortOrder),
      };
      
      if (formData.parentId) {
        data.parentId = Number(formData.parentId);
      } else {
        data.parentId = null;
      }

      await onSuccess(data);
      // onSuccess handles closing usually, but let's make sure
    } catch (error) {
      console.error(error);
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten tree for select options
  const renderOptions = (nodes: DepartmentVO[], level = 0): React.ReactNode[] => {
    let options: React.ReactNode[] = [];
    nodes.forEach(node => {
        // Disable selecting self or children as parent in edit mode (simplified check: just self for now)
        const disabled = mode === 'edit' && node.id === initialValues?.id;
        
        options.push(
            <option key={node.id} value={node.id} disabled={disabled}>
                {'\u00A0'.repeat(level * 4)}{node.name}
            </option>
        );
        if (node.children) {
            options = [...options, ...renderOptions(node.children, level + 1)];
        }
    });
    return options;
  };

  const footer = (
    <>
      <button
        onClick={onCancel}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
      >
        取消
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '提交中...' : '确定'}
      </button>
    </>
  );

  return (
    <StandardModal
      isOpen={visible}
      onClose={onCancel}
      title={mode === 'create' ? '新建部门' : '编辑部门'}
      footer={footer}
      width="max-w-md"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">部门名称 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="请输入部门名称"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">上级部门</label>
          <select
            value={formData.parentId}
            onChange={(e) => setFormData({...formData, parentId: e.target.value})}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          >
            <option value="">-- 无 (根部门) --</option>
            {renderOptions(treeData)}
          </select>
          <p className="text-xs text-gray-500">不选则作为根部门</p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">排序值</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({...formData, sortOrder: Number(e.target.value)})}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          />
          <p className="text-xs text-gray-500">数值越小越靠前</p>
        </div>
      </div>
    </StandardModal>
  );
};
