import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { userService } from '../../services/user';
import type { UserRole, UserStatus } from '@attendance/shared';
import { useToast } from '@/components/common/ToastProvider';
import StandardModal from '@/components/common/StandardModal';
import dayjs from 'dayjs';
import UserModal, { UserFormData } from './components/UserModal';

interface UserListItem {
  id: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  employeeName?: string;
  createdAt: string;
}

const ROLES = [
  { value: 'admin', label: '管理员' },
  { value: 'user', label: '普通用户' }
];

const UserList: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchName, setSearchName] = useState('');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] = useState<UserListItem | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Confirm Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    content: string;
    onConfirm: () => Promise<void>;
  }>({ title: '', content: '', onConfirm: async () => {} });

  const fetchData = async (currentPage = 1, currentSearch = searchName): Promise<void> => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ 
        page: currentPage, 
        pageSize,
        keyword: currentSearch 
      });
      setData(res.items);
      setTotal(res.total);
      setPage(currentPage);
      // Clear selection on page change/refresh
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData(1, searchName);
  };

  const handleReset = () => {
    setSearchName('');
    setPage(1);
    fetchData(1, '');
  };

  // Selection Logic
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map(u => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCreate = () => {
    setModalMode('create');
    setCurrentRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: UserListItem) => {
    setModalMode('edit');
    setCurrentRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmConfig({
      title: '确认删除',
      content: '确定要删除该用户吗？此操作无法撤销。',
      onConfirm: async () => {
        try {
          await userService.deleteUser(id);
          toast.success('删除成功');
          if (data.length === 1 && page > 1) {
            setPage(page - 1);
          } else {
            fetchData(page);
          }
          setConfirmModalOpen(false);
        } catch (error) {
          console.error(error);
          toast.error('删除失败');
        }
      }
    });
    setConfirmModalOpen(true);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    
    setConfirmConfig({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedIds.size} 个用户吗？`,
      onConfirm: async () => {
        try {
          await Promise.all(Array.from(selectedIds).map(id => userService.deleteUser(id)));
          toast.success('批量删除成功');
          setSelectedIds(new Set());
          fetchData(1);
          setConfirmModalOpen(false);
        } catch (error) {
          console.error(error);
          toast.error('部分删除失败，请刷新重试');
          fetchData(page);
        }
      }
    });
    setConfirmModalOpen(true);
  };

  const handleModalConfirm = async (formData: UserFormData) => {
    setSubmitLoading(true);
    try {
      if (modalMode === 'create') {
        await userService.createUser({
          username: formData.username,
          password: formData.password || '123456', // Default password
          role: formData.role,
          employeeId: formData.employeeId
        });
        toast.success('创建成功');
      } else if (modalMode === 'edit' && currentRecord) {
        await userService.updateUser(currentRecord.id, {
          role: formData.role,
          status: formData.status
        });
        toast.success('更新成功');
      }
      setIsModalOpen(false);
      fetchData(page);
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.status === 409) {
        toast.error('用户或关联员工已存在');
      } else {
        toast.error(modalMode === 'create' ? '创建失败' : '更新失败');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Badges
  const StatusBadge = ({ status }: { status: UserStatus }) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700',
      inactive: 'bg-amber-100 text-amber-700',
    };
    const labels = {
      active: '启用',
      inactive: '禁用',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: UserRole }) => {
    return (
      <span>{ROLES.find(r => r.value === role)?.label || role}</span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500 whitespace-nowrap">用户名:</label>
          <input 
            className="border border-gray-300 rounded px-3 py-1.5 w-64 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm"
            placeholder="请输入用户名"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSearch}
            className="bg-[#1e4ea1] hover:bg-blue-700 text-white px-6 py-1.5 rounded transition-all text-sm font-medium"
          >
            查询
          </button>
          <button 
            onClick={handleReset}
            className="border border-gray-300 hover:bg-gray-50 px-6 py-1.5 rounded transition-all text-sm"
          >
            重置
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <button 
          onClick={handleCreate}
          className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded text-sm hover:bg-gray-50 transition-all text-gray-700 bg-white shadow-sm"
        >
          <span className="material-icons text-lg">add</span> 添加
        </button>
        <button 
          disabled={selectedIds.size === 0}
          onClick={handleBatchDelete}
          className={`flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded text-sm transition-all text-gray-700 bg-white shadow-sm ${selectedIds.size > 0 ? 'hover:bg-red-50 hover:text-red-600' : 'opacity-50 cursor-not-allowed'}`}
        >
          <span className="material-icons text-lg">delete_outline</span> 删除
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#1e4ea1] focus:ring-[#1e4ea1]"
                    checked={data.length > 0 && selectedIds.size === data.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3">用户名</th>
                <th className="px-6 py-3">关联员工</th>
                <th className="px-6 py-3">角色</th>
                <th className="px-6 py-3 text-center">状态</th>
                <th className="px-6 py-3">创建时间</th>
                <th className="px-6 py-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                     <div className="flex flex-col items-center">
                       <span className="material-icons animate-spin text-2xl mb-2">refresh</span>
                       <p>加载中...</p>
                     </div>
                   </td>
                 </tr>
              ) : data.length > 0 ? (
                data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-[#1e4ea1] focus:ring-[#1e4ea1]"
                        checked={selectedIds.has(user.id)}
                        onChange={() => handleToggleSelect(user.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{user.username}</td>
                    <td className="px-6 py-4 text-gray-600">{user.employeeName || '-'}</td>
                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {dayjs(user.createdAt).format('YYYY-MM-DD HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3 text-gray-400 group-hover:text-gray-600 transition-colors">
                        <button onClick={() => handleEdit(user)} className="hover:text-[#1e4ea1] transition-colors" title="编辑">
                          <span className="material-icons text-lg">edit</span>
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="hover:text-red-500 transition-colors" title="删除">
                          <span className="material-icons text-lg">delete_outline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <span className="material-icons text-4xl mb-2">inbox</span>
                      <p>暂无数据</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-4 text-sm text-gray-600 bg-white">
          <span>共 {total} 条</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-gray-50 text-gray-400 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <span className="material-icons text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#1e4ea1] bg-[#1e4ea1] text-white">
              {page}
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= total}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons text-sm">chevron_right</span>
            </button>
          </div>
          <select 
            className="border border-gray-300 rounded px-3 py-1 bg-white text-sm outline-none"
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10条/页</option>
            <option value={20}>20条/页</option>
            <option value={50}>50条/页</option>
          </select>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={currentRecord ? {
          username: currentRecord.username,
          role: currentRecord.role,
          status: currentRecord.status,
          // employeeId not in UserListItem, might need separate fetch if critical, or use undefined
        } : undefined}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        loading={submitLoading}
      />

      {/* Confirmation Modal */}
      <StandardModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={confirmConfig.title}
        width="max-w-sm"
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              取消
            </button>
            <button
              onClick={confirmConfig.onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              确定
            </button>
          </div>
        }
      >
        <div className="flex items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <span className="material-icons text-red-600">warning</span>
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <div className="mt-2">
              <p className="text-sm text-gray-500">{confirmConfig.content}</p>
            </div>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

export default UserList;
