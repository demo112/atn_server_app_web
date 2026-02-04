
import React from 'react';
import { OrgNode } from '../types_ui';
import { ORG_TREE } from '../constants';

const TreeNode: React.FC<{ node: OrgNode; depth: number }> = ({ node, depth }) => {
  const isUser = node.type === 'user';
  const isDept = node.type === 'dept';
  const isGroup = node.type === 'group';

  return (
    <div className="space-y-1">
      <div 
        className={`flex items-center gap-2 text-sm p-2 rounded-lg cursor-pointer transition-colors ${
          isUser 
          ? 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400' 
          : isDept 
            ? 'text-slate-700 dark:text-slate-300 font-medium'
            : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="material-icons-round text-lg text-slate-400">
          {isDept ? 'domain' : isGroup ? 'groups' : 'person'}
        </span>
        {isGroup && <span className="material-icons-round text-sm mr-[-4px]">add_box</span>}
        <span className="truncate">{node.name}</span>
        {node.memberCount && <span className="text-primary font-bold ml-1">{node.memberCount}</span>}
      </div>
      {node.children && node.children.map(child => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export const OrgTree: React.FC = () => {
  return (
    <div className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-transparent focus:border-primary focus:ring-0 rounded-lg text-sm transition-all" 
            placeholder="输入关键字并回车" 
            type="text"
          />
        </div>
      </div>
      <div className="p-4 overflow-y-auto custom-scrollbar flex-grow">
        <div className="space-y-2">
          {ORG_TREE.map(node => (
            <TreeNode key={node.id} node={node} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
};
