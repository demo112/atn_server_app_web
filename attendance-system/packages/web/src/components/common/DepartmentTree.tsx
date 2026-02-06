import React, { useEffect, useState } from 'react';
import { departmentService } from '@/services/department';
import { DepartmentVO } from '@attendance/shared';

interface DepartmentTreeProps {
  onSelect: (id: number | null) => void;
  onNodeSelect?: (node: DepartmentVO | null) => void;
  selectedId?: number | null;
}

const TreeNode: React.FC<{
  node: DepartmentVO;
  selectedId?: number | null;
  onSelect: (id: number | null) => void;
  onNodeSelect?: (node: DepartmentVO | null) => void;
  level?: number;
}> = ({ node, selectedId, onSelect, onNodeSelect, level = 0 }) => {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  // 虚拟根节点 ID 为 -1
  const isVirtualRoot = node.id === -1;

  return (
    <li className="select-none">
      <div
        className={`px-2 py-1.5 cursor-pointer rounded text-sm flex items-center transition-colors ${
          isSelected 
            ? 'bg-blue-50 text-[#409eff] font-medium' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          // 如果是虚拟根节点，点击视为取消选择或选择空
          if (isVirtualRoot) {
            onSelect(null);
            onNodeSelect?.(null);
          } else {
            onSelect(node.id);
            onNodeSelect?.(node);
          }
        }}
      >
        <span className="material-icons text-base mr-2 text-[#409eff]">
          {level === 0 ? 'corporate_fare' : 'folder'}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {hasChildren && (
        <ul className="space-y-1 mt-1">
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onNodeSelect={onNodeSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({ onSelect, onNodeSelect, selectedId }) => {
  const [treeData, setTreeData] = useState<DepartmentVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const data = await departmentService.getTree();
        
        // 添加虚拟根节点
        const virtualRoot: DepartmentVO = {
          id: -1,
          name: '全公司',
          parentId: null,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: data
        };
        
        setTreeData([virtualRoot]);
      } catch (err) {
        console.error('Failed to fetch department tree:', err);
        setError('加载部门失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 h-full bg-gray-50 flex items-center justify-center">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 h-full bg-gray-50 overflow-auto">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 sticky top-0 bg-gray-50 pb-2 border-b border-gray-100">
        部门架构
      </h4>
      <ul className="space-y-1">
        {treeData.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
            onNodeSelect={onNodeSelect}
          />
        ))}
        {treeData.length === 0 && (
          <div className="text-gray-400 text-sm text-center py-4">暂无部门数据</div>
        )}
      </ul>
    </div>
  );
};
