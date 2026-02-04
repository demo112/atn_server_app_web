import React, { useEffect, useState, useCallback } from 'react';
import { EmployeeVo, CreateEmployeeDto, UpdateEmployeeDto } from '@attendance/shared';
import { employeeService } from '../../services/employee';
import { EmployeeModal } from './components/EmployeeModal';
import { BindUserModal } from './components/BindUserModal';
import StandardModal from '@/components/common/StandardModal';
import { useToast } from '@/components/common/ToastProvider';

const EmployeeList: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmployeeVo[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({ page: 1, pageSize: 10, keyword: '' });
  
  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeModalMode, setEmployeeModalMode] = useState<'create' | 'edit'>('create');
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeVo | null>(null);
  
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [bindEmployeeId, setBindEmployeeId] = useState<number | null>(null);

  // Confirm Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    content: string;
    onConfirm: () => Promise<void>;
  }>({ title: '', content: '', onConfirm: async () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchEmployees = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees(params);
      setData(res.items || []);
      setTotal(res.total);
    } catch (error: any) {
        toast.error('Fetch employees failed');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handlers
  const handleAdd = (): void => {
    setEmployeeModalMode('create');
    setCurrentEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEdit = (record: EmployeeVo): void => {
    setEmployeeModalMode('edit');
    setCurrentEmployee(record);
    setIsEmployeeModalOpen(true);
  };

  const showConfirm = (title: string, content: string, onConfirm: () => Promise<void>) => {
    setConfirmConfig({ title, content, onConfirm });
    setConfirmModalOpen(true);
  };

  const handleDelete = (id: number): void => {
    showConfirm(
      'Are you sure to delete this employee?',
      'This action will soft delete the employee.',
      async () => {
        try {
          await employeeService.deleteEmployee(id);
          toast.success('Deleted successfully');
          fetchEmployees();
        } catch (error) {
          toast.error('Failed to delete');
        }
      }
    );
  };

  const handleEmployeeModalOk = async (values: CreateEmployeeDto | UpdateEmployeeDto): Promise<void> => {
    try {
      if (employeeModalMode === 'create') {
        await employeeService.createEmployee(values as CreateEmployeeDto);
      } else {
        if (!currentEmployee) return;
        await employeeService.updateEmployee(currentEmployee.id, values as UpdateEmployeeDto);
      }
      toast.success(employeeModalMode === 'create' ? 'Created successfully' : 'Updated successfully');
      setIsEmployeeModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
        toast.error('Operation failed');
    }
  };

  const handleBindClick = (record: EmployeeVo): void => {
    setBindEmployeeId(record.id);
    setIsBindModalOpen(true);
  };

  const handleUnbindClick = (record: EmployeeVo): void => {
    showConfirm(
      'Unbind User',
      `Unbind user ${record.username}?`,
      async () => {
        try {
          await employeeService.bindUser(record.id, { userId: null });
          toast.success('Unbound successfully');
          fetchEmployees();
        } catch (error) {
          toast.error('Failed to unbind');
        }
      }
    );
  };

  const handleBindModalOk = async (userId: number | null): Promise<void> => {
    if (!bindEmployeeId) return;
    try {
      await employeeService.bindUser(bindEmployeeId, { userId });
      toast.success('Bound successfully');
      setIsBindModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast.error('Failed to bind');
    }
  };

  const handleConfirmOk = async () => {
    setConfirmLoading(true);
    try {
      await confirmConfig.onConfirm();
      setConfirmModalOpen(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmFooter = (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        onClick={() => setConfirmModalOpen(false)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        取消
      </button>
      <button
        onClick={handleConfirmOk}
        disabled={confirmLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {confirmLoading ? '处理中...' : '确定'}
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name/no"
                value={params.keyword}
                onChange={(e) => setParams({ ...params, page: 1, keyword: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm"
              />
              <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="material-icons mr-2 text-sm">add</span>
            Add Employee
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 h-[48px]">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee No</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked User</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">
                      <span className="material-icons text-4xl block mb-2 mx-auto text-gray-300">folder_open</span>
                      No employees found
                    </td>
                  </tr>
                ) : (
                  data.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors h-[56px]">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{record.employeeNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{record.deptName}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {record.username ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {record.username}
                            </span>
                            <button
                              onClick={() => handleUnbindClick(record)}
                              className="text-primary hover:text-primary/80 text-xs font-medium"
                            >
                              Unbind
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBindClick(record)}
                            className="text-primary hover:text-primary/80 text-xs font-medium"
                          >
                            Bind User
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-primary hover:text-primary/80"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
                disabled={params.page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setParams({ ...params, page: params.page + 1 })}
                disabled={params.page * params.pageSize >= total}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(params.page - 1) * params.pageSize + 1}</span> to <span className="font-medium">{Math.min(params.page * params.pageSize, total)}</span> of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
                    disabled={params.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>
                  <button
                    onClick={() => setParams({ ...params, page: params.page + 1 })}
                    disabled={params.page * params.pageSize >= total}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <span className="material-icons text-sm">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <EmployeeModal
          open={isEmployeeModalOpen}
          mode={employeeModalMode}
          initialValues={currentEmployee}
          onCancel={() => setIsEmployeeModalOpen(false)}
          onOk={handleEmployeeModalOk}
        />

        <BindUserModal
          open={isBindModalOpen}
          onCancel={() => setIsBindModalOpen(false)}
          onOk={handleBindModalOk}
        />

        <StandardModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title={confirmConfig.title}
          footer={confirmFooter}
          width="max-w-sm"
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
    </div>
  );
};

export default EmployeeList;
