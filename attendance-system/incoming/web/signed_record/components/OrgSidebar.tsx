
import React from 'react';
import { TreeItem } from '../types';
import { MOCK_ORG_TREE } from '../constants.tsx';

const TreeItemComponent: React.FC<{ item: TreeItem; depth: number }> = ({ item, depth }) => {
  const [isOpen, setIsOpen] = React.useState(item.isOpen);

  const getIcon = () => {
    switch (item.type) {
      case 'folder': return 'folder';
      case 'group': return 'groups';
      case 'person': return 'person';
      default: return 'folder';
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors ${isOpen && item.children ? 'text-primary' : 'text-slate-600'}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {item.children ? (
          <span className="material-symbols-outlined text-sm text-slate-400 group-hover:text-primary">
            {isOpen ? 'remove_circle_outline' : 'add_circle_outline'}
          </span>
        ) : (
          <span className="w-3.5"></span>
        )}
        <span className={`material-symbols-outlined text-lg ${item.type === 'group' && item.count ? 'text-primary' : 'text-slate-400'}`}>
          {getIcon()}
        </span>
        <span className="text-sm truncate">{item.label}</span>
        {item.count && <span className="text-xs text-slate-400 ml-1">({item.count})</span>}
      </div>
      
      {isOpen && item.children && (
        <div>
          {item.children.map(child => (
            <TreeItemComponent key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgSidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <input 
            className="w-full text-sm py-2 pl-3 pr-8 bg-slate-50 border-slate-200 focus:ring-primary focus:border-primary rounded-lg"
            placeholder="请输入关键字并回车" 
            type="text"
          />
          <span className="material-symbols-outlined absolute right-2.5 top-2 text-slate-400 text-lg">search</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {MOCK_ORG_TREE.map(item => (
          <TreeItemComponent key={item.id} item={item} depth={0} />
        ))}
      </div>
    </aside>
  );
};

export default OrgSidebar;
