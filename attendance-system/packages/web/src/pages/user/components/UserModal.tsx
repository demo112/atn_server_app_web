import React, { useState, useEffect } from 'react';
import { UserRole, UserStatus } from '@attendance/shared';
import StandardModal from '@/components/common/StandardModal';

// 定义表单数据类型
export interface UserFormData {
  username: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  employeeId?: number;
}

interface UserModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: Partial<UserFormData>;
  onClose: () => void;
  onConfirm: (data: UserFormData) => void;
  loading?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ 
  isOpen, 
  mode, 
  initialData, 
  onClose, 
  onConfirm,
  loading = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    role: 'user',
    status: 'active',
    password: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          username: initialData.username || '',
          role: initialData.role || 'user',
          status: initialData.status || 'active',
          password: '', // 编辑模式下密码默认为空
          employeeId: initialData.employeeId
        });
      } else {
        // 重置表单
        setFormData({
          username: '',
          role: 'user',
          status: 'active',
          password: ''
        });
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const isEdit = mode === 'edit';

  const footer = (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        取消
      </button>
      <button
        onClick={() => onConfirm(formData)}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '提交中...' : '确定'}
      </button>
    </div>
  );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑用户' : '添加用户'}
      footer={footer}
      width="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium text-gray-700">
            <span className="text-red-500 mr-1">*</span>用户名:
          </label>
          <div className="col-span-3">
            <input 
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              disabled={isEdit} // 用户名通常不可修改
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium text-gray-700">
            {!isEdit && <span className="text-red-500 mr-1">*</span>}密码:
          </label>
          <div className="col-span-3">
            <input 
              type="password"
              required={!isEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
              placeholder={isEdit ? "留空则不修改密码" : "请输入密码"}
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium text-gray-700">
            <span className="text-red-500 mr-1">*</span>角色:
          </label>
          <div className="col-span-3">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium text-gray-700">
            <span className="text-red-500 mr-1">*</span>状态:
          </label>
          <div className="col-span-3">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as UserStatus})}
            >
              <option value="active">启用</option>
              <option value="inactive">禁用</option>
            </select>
          </div>
        </div>
      </form>
    </StandardModal>
  );
};

export default UserModal;
