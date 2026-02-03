
import React, { useMemo } from 'react';
import { Tree, Spin, Empty } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { DownOutlined } from '@ant-design/icons';
import { DepartmentVO } from '@attendance/shared';

interface DepartmentTreeProps {
  loading: boolean;
  treeData: DepartmentVO[];
  onSelect: TreeProps['onSelect'];
  selectedKeys: React.Key[];
}

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({ 
  loading, 
  treeData, 
  onSelect,
  selectedKeys
}): React.ReactElement => {
  // 转换数据格式适配 AntD Tree
  const antdTreeData = useMemo(() => {
    const transform = (nodes: DepartmentVO[]): DataNode[] => {
      return nodes.map(node => ({
        title: node.name,
        key: node.id,
        children: node.children ? transform(node.children) : [],
        isLeaf: !node.children || node.children.length === 0,
      }));
    };
    return transform(treeData);
  }, [treeData]);

  if (loading && treeData.length === 0) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '20px' }} />;
  }

  if (treeData.length === 0) {
    return <Empty description="暂无部门数据" />;
  }

  return (
    <div style={{ padding: '10px' }}>
      <Tree
        showLine
        switcherIcon={<DownOutlined />}
        defaultExpandAll
        onSelect={onSelect}
        selectedKeys={selectedKeys}
        treeData={antdTreeData}
      />
    </div>
  );
};
