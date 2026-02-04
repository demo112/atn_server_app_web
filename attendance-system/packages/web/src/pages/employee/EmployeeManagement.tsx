import React, { useState, useEffect } from 'react';
import DepartmentSidebar from './components_new/DepartmentSidebar';
import PersonnelDashboard from './components_new/PersonnelDashboard';
import AddPersonModal from './components_new/AddPersonModal';
import { Person, FilterParams } from './types_ui';
import { employeeService } from '../../services/employee';
import { EmployeeVo, EmployeeStatus } from '@attendance/shared';

const mapEmployeeToPerson = (emp: EmployeeVo): Person => ({
  id: String(emp.id),
  name: emp.name,
  contact: emp.phone || '',
  gender: 'Unknown',
  department: emp.deptName || '',
  idType: 'Unknown',
  idNumber: emp.employeeNo,
  status: emp.status === EmployeeStatus.Active ? 'Active' : 'Inactive'
});

const EmployeeManagement: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async (params: FilterParams = { name: '', idNumber: '', status: '' }) => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees({
        keyword: params.name || params.idNumber,
        page: 1,
        pageSize: 100 // Load more for now
      });
      setPersons(res.items.map(mapEmployeeToPerson));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleFilterChange = (filters: FilterParams) => {
    fetchEmployees(filters);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除该人员吗？')) {
      try {
        await employeeService.deleteEmployee(Number(id));
        fetchEmployees();
      } catch (error) {
        console.error('Delete failed:', error);
        alert('删除失败');
      }
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    fetchEmployees();
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <DepartmentSidebar />
      <PersonnelDashboard 
        data={persons} 
        onFilterChange={handleFilterChange} 
        onDelete={handleDelete}
        onAdd={() => setIsAddModalOpen(true)}
      />
      
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <AddPersonModal 
            onClose={() => setIsAddModalOpen(false)} 
            // @ts-ignore: Prop not yet added to component
            onSuccess={handleAddSuccess}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
