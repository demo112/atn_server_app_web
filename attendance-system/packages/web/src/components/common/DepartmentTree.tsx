import React from 'react';

interface DepartmentTreeProps {
  onSelect: (id: number) => void;
}

export const DepartmentTree: React.FC<DepartmentTreeProps> = ({ onSelect }) => {
  return (
    <div style={{ border: '1px solid #ddd', padding: '10px', height: '100%', backgroundColor: '#f9f9f9' }}>
      <h4 style={{ margin: '0 0 10px 0' }}>部门架构</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ padding: '5px', cursor: 'pointer' }} onClick={() => onSelect(1)}>🏢 总经办</li>
        <li style={{ padding: '5px', cursor: 'pointer' }}>
          📂 研发部
          <ul style={{ listStyle: 'none', paddingLeft: '20px' }}>
            <li style={{ padding: '5px', cursor: 'pointer' }} onClick={() => onSelect(3)}>└─ 💻 后端组</li>
            <li style={{ padding: '5px', cursor: 'pointer' }} onClick={() => onSelect(4)}>└─ 🎨 前端组</li>
          </ul>
        </li>
        <li style={{ padding: '5px', cursor: 'pointer' }} onClick={() => onSelect(5)}>👥 人事部</li>
      </ul>
    </div>
  );
};
