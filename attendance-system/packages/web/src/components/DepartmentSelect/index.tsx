
import React, { useEffect, useState, useMemo } from 'react';
import { departmentService } from '../../services/department';
import { DepartmentVO } from '@attendance/shared';
import { useToast } from '@/components/common/ToastProvider';

export interface DepartmentSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value?: number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSelect?: (value: number) => void;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({ 
  value, 
  onChange, 
  onSelect,
  className = '', 
  ...props 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<DepartmentVO[]>([]);

  useEffect(() => {
    const fetchTree = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await departmentService.getTree();
        setTreeData(data || []);
      } catch (error) {
        toast.error('Fetch department tree failed');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  const flattenedOptions = useMemo(() => {
    const options: { id: number; name: string; level: number }[] = [];
    
    const traverse = (nodes: DepartmentVO[], level: number) => {
      nodes.forEach(node => {
        options.push({ id: node.id, name: node.name, level });
        if (node.children) {
          traverse(node.children, level + 1);
        }
      });
    };
    
    traverse(treeData, 0);
    return options;
  }, [treeData]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (onSelect) {
      const val = e.target.value ? Number(e.target.value) : undefined;
      if (val !== undefined) onSelect(val);
    }
  };

  return (
    <select
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${className}`}
      value={value || ''}
      onChange={handleChange}
      disabled={loading}
      {...props}
    >
      <option value="">请选择部门</option>
      {flattenedOptions.map(opt => (
        <option key={opt.id} value={opt.id}>
          {'\u00A0\u00A0'.repeat(opt.level)}{opt.name}
        </option>
      ))}
    </select>
  );
};
