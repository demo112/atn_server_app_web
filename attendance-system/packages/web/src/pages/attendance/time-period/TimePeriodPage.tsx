import React, { useEffect, useState, useCallback } from 'react';
import { TimePeriod } from '@attendance/shared';
import { getTimePeriods, deleteTimePeriod } from '@/services/time-period';
import { TimePeriodDialog } from './components/TimePeriodDialog';
import { useToast } from '@/components/common/ToastProvider';
import { logger } from '@/utils/logger';
import StandardModal from '@/components/common/StandardModal';

const TimePeriodPage: React.FC = (): React.ReactElement => {
  const { toast } = useToast();
  const [periods, setPeriods] = useState<TimePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | undefined>(undefined);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchPeriods = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getTimePeriods();
      setPeriods(data);
    } catch (error) {
      logger.error('Failed to fetch time periods:', error);
      toast.error('加载时间段列表失败');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteId) return;

    try {
      await deleteTimePeriod(deleteId);
      toast.success('删除成功');
      setDeleteConfirmOpen(false);
      fetchPeriods();
    } catch (error) {
      logger.error('Failed to delete:', error);
      toast.error('删除失败');
    }
  };

  const handleEdit = (period: TimePeriod): void => {
    setSelectedPeriod(period);
    setIsDialogOpen(true);
  };

  const handleCreate = (): void => {
    setSelectedPeriod(undefined);
    setIsDialogOpen(true);
  };

  const handleSuccess = (): void => {
    setIsDialogOpen(false);
    fetchPeriods();
  };

  const formatTime = (start?: string, end?: string): string => {
    if (!start && !end) return '-';
    return `${start || ''} - ${end || ''}`;
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">时间段设置</h2>
          <button 
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-icons text-lg mr-1">add</span>
            新建时间段
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-[1000px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工作时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">休息时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">加载中...</td>
                  </tr>
                ) : periods.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                      <span className="material-icons text-4xl block mb-2 mx-auto text-gray-300">event_busy</span>
                      暂无时间段数据
                    </td>
                  </tr>
                ) : (
                  periods.map((period) => (
                    <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {period.type === 0 ? '固定班制' : '弹性班制'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(period.startTime, period.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(period.restStartTime, period.restEndTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button 
                          onClick={() => handleEdit(period)}
                          className="text-primary hover:text-primary/80 transition-colors inline-flex items-center"
                        >
                          <span className="material-icons text-sm mr-1">edit</span>
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(period.id)}
                          className="text-red-600 hover:text-red-900 transition-colors inline-flex items-center"
                        >
                          <span className="material-icons text-sm mr-1">delete</span>
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TimePeriodDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleSuccess}
        initialData={selectedPeriod}
      />

      <StandardModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="确认删除"
        width="max-w-sm"
        footer={
          <>
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              确认删除
            </button>
          </>
        }
      >
        <p className="text-gray-600">确定要删除这个时间段吗？如果已被班次引用将无法删除。</p>
      </StandardModal>
    </div>
  );
};

export default TimePeriodPage;
