import React, { useState } from 'react';
import { DepartmentTree } from '@/components/common/DepartmentTree';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { ScheduleDialog } from './components/ScheduleDialog';
import { BatchScheduleDialog } from './components/BatchScheduleDialog';
import { useToast } from '@/components/common/ToastProvider';

const SchedulePage: React.FC = (): React.ReactElement => {
  const { toast } = useToast();
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 用于触发日历刷新

  const handleSuccess = (): void => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="flex h-full gap-5 p-2.5 bg-white">
      {/* 左侧部门树 */}
      <div className="w-[250px] flex-shrink-0 border-r border-gray-100 pr-5">
        <DepartmentTree onSelect={setSelectedDeptId} />
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col">
        <header className="mb-5 flex justify-between items-center pb-2.5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 m-0 flex items-center gap-2">
            排班管理 
            {selectedDeptId && <span className="text-sm text-gray-500 font-normal">(部门ID: {selectedDeptId})</span>}
          </h2>
          <div className="flex gap-2.5">
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors shadow-sm text-sm font-medium"
            >
              + 新建排班
            </button>
            <button 
              onClick={() => {
                if (!selectedDeptId) return toast.error('请先选择部门');
                setIsBatchOpen(true);
              }}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              批量排班
            </button>
          </div>
        </header>

        {/* 日历视图区域 */}
        <div className="flex-1 border border-gray-200 rounded-lg p-5 bg-white overflow-auto shadow-sm">
           {selectedDeptId ? (
             <ScheduleCalendar key={refreshKey} deptId={selectedDeptId} />
           ) : (
             <div className="h-full flex justify-center items-center text-gray-400 text-lg">
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
