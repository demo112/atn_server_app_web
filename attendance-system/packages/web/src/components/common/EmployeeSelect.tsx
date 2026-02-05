import React, { useEffect, useState } from 'react';
import { EmployeeVo } from '@attendance/shared';
import { employeeService } from '@/services/employee';

interface EmployeeSelectProps {
  deptId?: number | null;
  value?: number;
  onChange: (value: number | undefined) => void;
  className?: string;
}

export const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  deptId,
  value,
  onChange,
  className = ''
}) => {
  const [employees, setEmployees] = useState<EmployeeVo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // 如果没有选部门，是否加载所有？
        // 为了性能，如果没选部门，我们可以加载前100个，或者不加载。
        // 但用户可能想直接搜人。
        // 简单起见，这里加载列表。注意：如果人太多会有性能问题。
        // 考虑到是"联动"，通常依赖部门。
        
        const params: any = {
          page: 1,
          pageSize: 1000, // 下拉框最大限制
        };
        
        if (deptId) {
          params.deptId = deptId;
        }

        const res = await employeeService.getEmployees(params);
        setEmployees(res.items);
      } catch (error) {
        console.error('Failed to load employees', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [deptId]);

  return (
    <select
      value={value || ''}
      onChange={(e) => {
        const val = e.target.value ? Number(e.target.value) : undefined;
        onChange(val);
      }}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
      disabled={loading}
    >
      <option value="">全部人员</option>
      {employees.map(emp => (
        <option key={emp.id} value={emp.id}>
          {emp.name} ({emp.employeeNo})
        </option>
      ))}
    </select>
  );
};
