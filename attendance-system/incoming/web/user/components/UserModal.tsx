
import React, { useState, useEffect } from 'react';
import { User, UserStatus, ModalType } from '../types';
import { DEPARTMENTS, ROLES } from '../constants';

interface UserModalProps {
  type: ModalType;
  user?: User;
  onClose: () => void;
  onConfirm: (user: Partial<User>) => void;
}

const UserModal: React.FC<UserModalProps> = ({ type, user, onClose, onConfirm }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    phone: '',
    employeeId: '',
    department: DEPARTMENTS[0],
    role: '',
    status: UserStatus.PENDING
  });

  useEffect(() => {
    if (user && type === 'edit') {
      setFormData(user);
    }
  }, [user, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  if (!type) return null;

  const isEdit = type === 'edit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? '编辑用户' : '添加用户'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* If it's the "Edit" version from the first screenshot, it might be simpler, 
              but typically "Add" is more complex. We'll show the complex one for Add 
              and a selective one for Edit based on context. */}
          
          {(!isEdit) && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-1">*</span>姓名:
                </label>
                <div className="col-span-3">
                  <input 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
                    placeholder="请输入姓名"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-1">*</span>手机号码:
                </label>
                <div className="col-span-3">
                  <input 
                    required
                    type="tel"
                    className="w-full px-3 py-2 border border-blue-400 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none shadow-sm shadow-blue-50"
                    placeholder="请输入手机号码"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium text-gray-700">工号:</label>
                <div className="col-span-3">
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
                    placeholder="请输入工号"
                    value={formData.employeeId}
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-1">*</span>部门:
                </label>
                <div className="col-span-3 relative">
                  <select 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none appearance-none cursor-pointer"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium text-gray-700">
              <span className="text-red-500 mr-1">*</span>角色:
            </label>
            <div className="col-span-3 relative">
              <select 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none appearance-none cursor-pointer"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="" disabled>请选择</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">keyboard_arrow_down</span>
            </div>
          </div>

          {!isEdit && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="sms-notify"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="sms-notify" className="text-sm text-gray-600 cursor-pointer">短信通知用户</label>
              </div>
            </div>
          )}
        </form>

        <div className="flex items-center justify-center gap-4 px-6 py-6 border-t border-gray-50 bg-gray-50/50">
          <button 
            type="submit"
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary-dark text-white px-12 py-2 rounded-md font-medium transition-all shadow-lg shadow-blue-100"
          >
            确定
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-gray-50 text-gray-700 px-12 py-2 border border-gray-300 rounded-md font-medium transition-all"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
