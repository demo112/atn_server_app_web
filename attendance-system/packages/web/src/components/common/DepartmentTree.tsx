import React from 'react';

interface DepartmentTreeProps {
  onSelect: (id: number) => void;
}

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({ onSelect }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 h-full bg-gray-50">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">部门架构</h4>
      <ul className="space-y-1">
        <li 
          className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm text-gray-600 flex items-center" 
          onClick={() => onSelect(1)}
        >
          <span className="mr-2">🏢</span> 总经办
        </li>
        <li className="px-2 py-1.5 text-sm text-gray-600">
          <div className="flex items-center mb-1">
            <span className="mr-2">📂</span> 研发部
          </div>
          <ul className="pl-6 space-y-1">
            <li 
              className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded flex items-center" 
              onClick={() => onSelect(3)}
            >
              <span className="text-gray-400 mr-2">└─</span> 💻 后端组
            </li>
            <li 
              className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded flex items-center" 
              onClick={() => onSelect(4)}
            >
              <span className="text-gray-400 mr-2">└─</span> 🎨 前端组
            </li>
          </ul>
        </li>
        <li 
          className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded text-sm text-gray-600 flex items-center" 
          onClick={() => onSelect(5)}
        >
          <span className="mr-2">👥</span> 人事部
        </li>
      </ul>
    </div>
  );
};
