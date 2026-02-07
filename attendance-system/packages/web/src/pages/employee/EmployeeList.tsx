import React, { useEffect, useState, useCallback } from 'react';
import { EmployeeVo, CreateEmployeeDto, UpdateEmployeeDto } from '@attendance/shared';
import { employeeService } from '../../services/employee';
import { EmployeeModal } from './components/EmployeeModal';
import { useToast } from '@/components/common/ToastProvider';
import DepartmentSidebar from './components_new/DepartmentSidebar';
import PersonnelDashboard from './components_new/PersonnelDashboard';
import { Person, FilterParams } from './types_ui';

const EmployeeList: React.FC = () => {
  const { toast } = useToast();
  // const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Person[]>([]);
  // const [total, setTotal] = useState(0);
  const [params, setParams] = useState({ 
    page: 1, 
    pageSize: 10, 
    keyword: '',
    deptId: undefined as number | undefined,
    employeeId: undefined as number | undefined,
    status: 'all' as string
  });
  
  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeModalMode, setEmployeeModalMode] = useState<'create' | 'edit'>('create');
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeVo | null>(null);
  
  // Confirm Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    content: string;
    onConfirm: () => Promise<void>;
  }>({ title: '', content: '', onConfirm: async () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const mapEmployeeToPerson = (emp: EmployeeVo): Person => ({
    id: String(emp.id),
    employeeNo: emp.employeeNo,
    name: emp.name,
    contact: emp.phone || emp.email || '-',
    gender: 'Unknown', // Not in EmployeeVo
    department: emp.deptName || '-',
    idType: '-', // Not in EmployeeVo
    idNumber: '-', // Not in EmployeeVo
    status: emp.status
  });

  const fetchEmployees = useCallback(async (): Promise<void> => {
    // setLoading(true);
    try {
      const apiParams: any = {
        page: params.page,
        pageSize: params.pageSize,
        keyword: params.keyword,
        deptId: params.deptId,
        employeeId: params.employeeId
      };
      
      const res = await employeeService.getEmployees(apiParams);
      setData(res.items.map(mapEmployeeToPerson));
      // setTotal(res.total);
    } catch (error: any) {
        toast.error('获取人员列表失败');
    } finally {
      // setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Handlers
  const handleDeptSelect = (deptId: string) => {
    // If deptId is '-1' (Virtual Root), treat it as undefined to fetch all employees
    const parsedId = (deptId && deptId !== '-1') ? Number(deptId) : undefined;
    setParams(prev => ({ 
      ...prev, 
      deptId: parsedId, 
      page: 1 
    }));
  };

  const handleFilterChange = (filters: FilterParams) => {
    // Merge filters into params
    setParams(prev => ({
      ...prev,
      keyword: filters.name || filters.idNumber || '',
      deptId: filters.deptId,
      employeeId: filters.employeeId,
      status: filters.status,
      page: 1
    }));
  };

  const handleAdd = (): void => {
    setEmployeeModalMode('create');
    setCurrentEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEdit = async (id: string): Promise<void> => {
    try {
      // Need to fetch full employee details or use what we have if sufficient
      // But Person is a subset/view. Best to fetch or find in current data if EmployeeVo is needed.
      // We don't have full EmployeeVo in 'data' state anymore (it is Person[]).
      // So fetch by ID.
      const emp = await employeeService.getEmployee(Number(id));
      setEmployeeModalMode('edit');
      setCurrentEmployee(emp);
      setIsEmployeeModalOpen(true);
    } catch (e) {
      toast.error('获取人员详情失败');
    }
  };

  const showConfirm = (title: string, content: string, onConfirm: () => Promise<void>) => {
    setConfirmConfig({ title, content, onConfirm });
    setConfirmModalOpen(true);
  };

  const handleDelete = (id: string): void => {
    showConfirm(
      '确定要删除该员工吗？',
      '此操作将软删除该员工。',
      async () => {
        try {
          await employeeService.deleteEmployee(Number(id));
          toast.success('删除成功');
          fetchEmployees();
        } catch (error) {
          toast.error('删除失败');
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
      toast.success(employeeModalMode === 'create' ? '创建成功' : '更新成功');
      setIsEmployeeModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
        console.error('Employee operation failed:', error);
        const message = error.response?.data?.message || error.message || '操作失败';
        toast.error(message);
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

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar - Department Tree */}
      <DepartmentSidebar onSelect={handleDeptSelect} />

      {/* Right Content - Personnel Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PersonnelDashboard 
          data={data}
          onFilterChange={handleFilterChange}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      </div>

      <EmployeeModal
        open={isEmployeeModalOpen}
        mode={employeeModalMode}
        initialValues={currentEmployee}
        defaultDeptId={params.deptId}
        onCancel={() => setIsEmployeeModalOpen(false)}
        onOk={handleEmployeeModalOk}
      />

      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-3 bg-[#409eff] flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                {confirmConfig.title}
              </h3>
              <button 
                onClick={() => setConfirmModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors focus:outline-none flex items-center justify-center"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>
            
            <div className="p-6">
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
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#409eff]"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
