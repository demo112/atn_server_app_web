import React, { useState } from 'react';
import { DepartmentVO } from '@attendance/shared';

interface DepartmentTreeProps {
  loading: boolean;
  treeData: DepartmentVO[];
  onSelect: (keys: React.Key[], info: any) => void;
  selectedKeys: React.Key[];
}

const TreeNode: React.FC<{
  node: DepartmentVO;
  selectedKeys: React.Key[];
  onSelect: (keys: React.Key[], info: any) => void;
  level: number;
}> = ({ node, selectedKeys, onSelect, level }) => {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedKeys.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect([node.id], { selected: true, node });
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <li>
      <div
        className={`flex items-center py-1.5 px-2 cursor-pointer rounded-md transition-colors ${
          isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 16 + 4}px` }}
        onClick={handleSelect}
      >
        <div
          className={`mr-1 p-0.5 rounded hover:bg-black/5 text-gray-400 flex items-center justify-center transition-colors ${
            hasChildren ? 'visible' : 'invisible'
          }`}
          onClick={toggleExpand}
        >
          <span className="material-icons text-lg leading-none">
            {expanded ? 'arrow_drop_down' : 'arrow_right'}
          </span>
        </div>
        <span className="material-icons text-sm mr-2 text-gray-400">
          {hasChildren ? 'folder' : 'description'}
        </span>
        <span className="text-sm truncate select-none flex-1">{node.name}</span>
      </div>
      {hasChildren && expanded && (
        <ul>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              selectedKeys={selectedKeys}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({
  loading,
  treeData,
  onSelect,
  selectedKeys,
}) => {
  if (loading && (!treeData || treeData.length === 0)) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-primary"></div>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center">
        <span className="material-icons text-4xl mb-2 text-gray-300">folder_off</span>
        暂无部门数据
      </div>
    );
  }

  return (
    <ul className="select-none space-y-0.5">
      {treeData.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedKeys={selectedKeys}
          onSelect={onSelect}
          level={0}
        />
      ))}
    </ul>
  );
};
