import React, { useState } from 'react';
import { DepartmentTree } from '@/components/common/DepartmentTree';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { ScheduleDialog } from './components/ScheduleDialog';
import { BatchScheduleDialog } from './components/BatchScheduleDialog';

import { message } from 'antd';

const SchedulePage: React.FC = (): React.ReactElement => {
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 用于触发日历刷新

  const handleSuccess = (): void => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: '20px', padding: '10px' }}>
      {/* 左侧部门树 */}
      <div style={{ width: '250px', flexShrink: 0 }}>
        <DepartmentTree onSelect={setSelectedDeptId} />
      </div>

      {/* 右侧内容区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '10px',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ margin: 0 }}>排班管理 {selectedDeptId ? <span style={{fontSize: '0.8em', color: '#666'}}>(部门ID: {selectedDeptId})</span> : ''}</h2>
          <div>
            <button 
              onClick={() => setIsCreateOpen(true)}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              + 新建排班
            </button>
            <button 
              onClick={() => {
                if (!selectedDeptId) return message.error('请先选择部门');
                setIsBatchOpen(true);
              }}
              style={{ marginLeft: '10px', padding: '8px 16px', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #d9d9d9', borderRadius: '4px' }}
            >
              批量排班
            </button>
          </div>
        </header>

        {/* 日历视图区域 */}
        <div style={{ 
          flex: 1, 
          border: '1px solid #eee', 
          borderRadius: '4px',
          padding: '20px',
          backgroundColor: 'white',
          overflow: 'auto'
        }}>
           {selectedDeptId ? (
             <ScheduleCalendar key={refreshKey} deptId={selectedDeptId} />
           ) : (
             <div style={{ 
               height: '100%', 
               display: 'flex', 
               justifyContent: 'center', 
               alignItems: 'center',
               color: '#ccc' 
             }}>
               请选择左侧部门查看排班
             </div>
           )}
        </div>
      </div>

      {/* 弹窗 */}
      <ScheduleDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={handleSuccess}
      />
      <BatchScheduleDialog
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onSuccess={handleSuccess}
        deptId={selectedDeptId || undefined}
      />
    </div>
  );
};

export default SchedulePage;
