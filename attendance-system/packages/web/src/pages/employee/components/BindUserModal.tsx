import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/user';
import { useToast } from '@/components/common/ToastProvider';

interface BindUserModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (userId: number | null) => Promise<void>;
  confirmLoading?: boolean;
}

export const BindUserModal: React.FC<BindUserModalProps> = ({
  open,
  onCancel,
  onOk,
  confirmLoading,
}) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<{ label: string; value: number }[]>([]);
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchUsers = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ page: 1, pageSize: 20, keyword: searchKeyword });
      const options = res.items
        .filter((u: any) => !u.employeeName) // Only show unbound users
        .map((u: any) => ({
          label: u.username,
          value: u.id,
        }));
      setUsers(options);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      setValue(null);
      setKeyword('');
    }
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        fetchUsers(keyword);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, open]);

  const handleOk = async () => {
    if (value === null) {
        // Allow unbinding if that's the intention? 
        // The original code passed `value` directly. 
        // If it's nullable in props, it's fine.
    }
    await onOk(value);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-3 bg-[#409eff] flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">
            Bind User Account
          </h3>
          <button 
            onClick={onCancel}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors focus:outline-none flex items-center justify-center"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search User
                </label>
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow mb-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User
                </label>
                <select
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#409eff]/50 focus:border-[#409eff] sm:text-sm transition-shadow"
                >
                    <option value="">-- Select a user --</option>
                    {users.map((user) => (
                        <option key={user.value} value={user.value}>
                        {user.label}
                        </option>
                    ))}
                </select>
                {loading && <p className="text-xs text-gray-500 mt-1">Loading users...</p>}
            </div>
            
            <div className="text-xs text-gray-500">
              * Only users not bound to other employees are shown.
            </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#409eff]"
          >
            取消
          </button>
          <button
            onClick={handleOk}
            disabled={loading || confirmLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#409eff] hover:bg-[#409eff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#409eff] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || confirmLoading ? '提交中...' : '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};
