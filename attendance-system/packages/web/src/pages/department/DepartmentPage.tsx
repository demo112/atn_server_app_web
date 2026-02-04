import React, { useEffect, useState, useCallback } from 'react';
import { DepartmentTree } from './components/DepartmentTree';
import { DepartmentForm } from './components/DepartmentForm';
import { departmentService } from '../../services/department';
import { DepartmentVO } from '@attendance/shared';
import { useToast } from '@/components/common/ToastProvider';
import StandardModal from '@/components/common/StandardModal';

const DepartmentPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<DepartmentVO[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentVO | null>(null);

  // Form State
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitialValues, setFormInitialValues] = useState<Partial<DepartmentVO> | undefined>(undefined);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const data = await departmentService.getTree();
      setTreeData(data || []);
    } catch (error) {
      toast.error('获取部门树失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchDepartment = async (key: number): Promise<void> => {
    try {
      const data = await departmentService.getDepartment(key);
      setSelectedDepartment(data || null);
    } catch {
      toast.error('Failed to load department details');
    }
  };

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleSelect = (keys: React.Key[]): void => {
    setSelectedKeys(keys);
    if (keys.length > 0) {
      fetchDepartment(keys[0] as number);
    } else {
      setSelectedDepartment(null);
    }
  };

  const handleCreate = (): void => {
    setFormMode('create');
    setFormInitialValues({ parentId: selectedDepartment?.id || undefined }); // 默认选中当前部门为父部门
    setFormVisible(true);
  };

  const handleEdit = (): void => {
    if (!selectedDepartment) return;
    setFormMode('edit');
    setFormInitialValues(selectedDepartment);
    setFormVisible(true);
  };

  const handleDeleteClick = (): void => {
    if (!selectedDepartment) return;
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;
    try {
      await departmentService.deleteDepartment(selectedDepartment.id);
      toast.success('删除成功');
      setSelectedDepartment(null);
      setSelectedKeys([]);
      setDeleteConfirmOpen(false);
      fetchTree();
    } catch (error) {
      console.error(error);
      toast.error('删除失败');
    }
  };

  const handleFormSuccess = (): void => {
    setFormVisible(false);
    fetchTree();
    // 如果是编辑当前选中节点，刷新详情
    if (formMode === 'edit' && selectedDepartment) {
      fetchDepartment(selectedDepartment.id);
    }
  };

  const deleteFooter = (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={() => setDeleteConfirmOpen(false)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        取消
      </button>
      <button
        onClick={confirmDelete}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        确认删除
      </button>
    </div>
  );

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex flex-col border-r border-gray-200 bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-gray-800">组织架构</h2>
          <div className="flex gap-1">
            <button
              onClick={fetchTree}
              disabled={loading}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="刷新"
            >
              <span className="material-icons text-xl">refresh</span>
            </button>
            <button
              onClick={handleCreate}
              className="p-1.5 text-primary hover:text-primary/80 hover:bg-blue-50 rounded-md transition-colors"
              title="新增部门"
            >
              <span className="material-icons text-xl">add</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          <DepartmentTree
            loading={loading}
            treeData={treeData}
            onSelect={handleSelect}
            selectedKeys={selectedKeys}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedDepartment ? (
          <div className="p-8 max-w-3xl">
            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedDepartment.name}</h1>
                <p className="text-sm text-gray-500">部门详情信息</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <span className="material-icons text-sm mr-2">edit</span>
                  编辑
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="material-icons text-sm mr-2">delete</span>
                  删除
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <dl className="divide-y divide-gray-200">
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">部门ID</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{selectedDepartment.id}</dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-white">
                  <dt className="text-sm font-medium text-gray-500">部门名称</dt>
                  <dd className="text-sm text-gray-900 col-span-2 font-medium">{selectedDepartment.name}</dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">上级部门ID</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {selectedDepartment.parentId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ID: {selectedDepartment.parentId}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">无 (根部门)</span>
                    )}
                  </dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-white">
                  <dt className="text-sm font-medium text-gray-500">排序值</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{selectedDepartment.sortOrder}</dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">创建时间</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {new Date(selectedDepartment.createdAt).toLocaleString()}
                  </dd>
                </div>
                <div className="px-6 py-4 grid grid-cols-3 gap-4 bg-white">
                  <dt className="text-sm font-medium text-gray-500">更新时间</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {new Date(selectedDepartment.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-5xl text-gray-300">account_tree</span>
            </div>
            <p className="text-lg font-medium text-gray-500">请选择左侧部门查看详情</p>
            <p className="text-sm mt-2">点击部门节点查看或编辑详细信息</p>
          </div>
        )}
      </div>

      <DepartmentForm
        visible={formVisible}
        mode={formMode}
        initialValues={formInitialValues}
        treeData={treeData}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <StandardModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="确认删除"
        footer={deleteFooter}
        width="max-w-sm"
      >
        <div className="flex items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <span className="material-icons text-red-600">warning</span>
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              删除部门
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                确定要删除部门 "{selectedDepartment?.name}" 吗？此操作不可恢复。
              </p>
            </div>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

export default DepartmentPage;
