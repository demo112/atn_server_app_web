
import React, { useEffect, useState, useMemo } from 'react';
import { TreeSelect, TreeSelectProps } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { departmentService } from '../../services/department';
import { DepartmentVO } from '@attendance/shared';
import { logger } from '../../utils/logger';

export type DepartmentSelectProps = Omit<TreeSelectProps, 'treeData' | 'loadData'>;

export const DepartmentSelect: React.FC<DepartmentSelectProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<DepartmentVO[]>([]);

  useEffect(() => {
    const fetchTree = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await departmentService.getTree();
        setTreeData(data || []);
      } catch (error) {
        logger.error('Fetch department tree failed', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  // 转换 TreeData 供 TreeSelect 使用
  const renderTreeSelectData = useMemo(() => {
    const transform = (nodes: DepartmentVO[]): DataNode[] => {
      return nodes.map(node => ({
        title: node.name,
        value: node.id,
        key: node.id,
        children: node.children ? transform(node.children) : [],
      }));
    };
    return transform(treeData);
  }, [treeData]);

  return (
    <TreeSelect
      treeData={renderTreeSelectData}
      loading={loading}
      placeholder="请选择部门"
      allowClear
      treeDefaultExpandAll
      showSearch
      treeNodeFilterProp="title"
      {...props}
    />
  );
};
