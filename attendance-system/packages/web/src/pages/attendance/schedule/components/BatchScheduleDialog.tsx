import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendance';
import { Shift } from '@attendance/shared';
import { useToast } from '@/components/common/ToastProvider';
import { logger } from '@/utils/logger';
import StandardModal from '@/components/common/StandardModal';

interface BatchScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deptId?: number;
}

export const BatchScheduleDialog: React.FC<BatchScheduleDialogProps> = ({ isOpen, onClose, onSuccess, deptId }): React.ReactElement | null => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [formData, setFormData] = useState({
    shiftId: '',
    startDate: '',
    endDate: '',
    force: false,
    includeSubDepartments: false
  });

  const loadData = async (): Promise<void> => {
      try {
          console.log('[BatchScheduleDialog] Loading shifts...');
          const res = await attendanceService.getShifts();
          console.log(`[BatchScheduleDialog] Loaded ${res.length} shifts`);
          setShifts(res);
      } catch (e) {
          logger.error('Failed to load shifts', e);
      }
  };

  useEffect(() => {
    if (isOpen) {
        loadData();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (!deptId) {
        toast.error('请先选择部门');
        return;
    }
    setLoading(true);
    try {
      const res = await attendanceService.batchCreateSchedule({
        departmentIds: [deptId],
        shiftId: Number(formData.shiftId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        force: formData.force,
        includeSubDepartments: formData.includeSubDepartments
      });
      toast.success(`批量排班成功，影响 ${res.count} 条记录`);
      onSuccess();
      onClose();
    } catch (err) {
      logger.error('Batch schedule failed', err);
      toast.error('批量创建失败');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
      >
        取消
      </button>
      <button
        onClick={() => handleSubmit()}
        disabled={loading}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '提交中...' : '提交'}
      </button>
    </>
  );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={`批量排班 (部门ID: ${deptId})`}
      footer={footer}
      width="max-w-md"
    >
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="batchShiftId" className="block text-sm font-medium text-gray-700">选择班次</label>
            <select 
                id="batchShiftId"
                value={formData.shiftId} 
                onChange={e => setFormData({...formData, shiftId: e.target.value})} 
                required 
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
            >
                <option value="">-- 请选择 --</option>
                {shifts.map(shift => (
                    <option key={shift.id} value={shift.id}>
                        {shift.name}
                    </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label htmlFor="batchStartDate" className="block text-sm font-medium text-gray-700">开始日期</label>
                <input 
                    id="batchStartDate"
                    type="date" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
                />
            </div>
            <div className="space-y-1">
                <label htmlFor="batchEndDate" className="block text-sm font-medium text-gray-700">结束日期</label>
                <input 
                    id="batchEndDate"
                    type="date" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
                />
            </div>
          </div>

          <div className="space-y-3">
             <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <input 
                        type="checkbox" 
                        id="batchForce" 
                        checked={formData.force} 
                        onChange={e => setFormData({...formData, force: e.target.checked})} 
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="batchForce" className="text-sm font-medium text-gray-700 cursor-pointer">
                        强制覆盖 (忽略冲突)
                    </label>
                </div>
                {formData.force && (
                    <div className="text-xs text-amber-500 ml-6">
                        注意：存在跨天重叠时，新排班将优先，自动覆盖旧排班的重叠部分。
                    </div>
                )}
             </div>
             
             <div className="flex items-center space-x-2">
                <input 
                    type="checkbox" 
                    id="includeSub" 
                    checked={formData.includeSubDepartments} 
                    onChange={e => setFormData({...formData, includeSubDepartments: e.target.checked})} 
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="includeSub" className="text-sm font-medium text-gray-700 cursor-pointer">
                    包含子部门
                </label>
             </div>
          </div>
        </div>
    </StandardModal>
  );
};
