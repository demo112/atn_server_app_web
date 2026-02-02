import React, { useEffect, useState } from 'react';
import { Select } from 'antd';

interface Department {
  id: number;
  name: string;
}

interface DepartmentSelectProps {
  onChange?: (value: number) => void;
  value?: number;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ onChange, value }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // 模拟 API 调用
    const fetchDepts = async () => {
      // 实际项目中这里会调用 service
      await new Promise(resolve => setTimeout(resolve, 100));
      if (mounted) {
        setDepartments([
          { id: 1, name: '研发部' },
          { id: 2, name: '市场部' },
          { id: 3, name: '人事部' },
        ]);
        setLoading(false);
      }
    };

    fetchDepts();
    return () => { mounted = false; };
  }, []);

  return (
    <Select
      placeholder="请选择部门"
      loading={loading}
      value={value}
      onChange={onChange}
      style={{ width: 200 }}
      options={departments.map(d => ({ label: d.name, value: d.id }))}
      data-testid="department-select"
    />
  );
};
