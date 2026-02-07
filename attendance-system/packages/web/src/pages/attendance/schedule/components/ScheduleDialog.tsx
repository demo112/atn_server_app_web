import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { attendanceService } from '@/services/attendance';
import { employeeService } from '@/services/employee';
import { EmployeeVo, Shift } from '@attendance/shared';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/common/ToastProvider';
import StandardModal from '@/components/common/StandardModal';

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ isOpen, onClose, onSuccess }): React.ReactElement | null => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeVo[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    startDate: '',
    endDate: '',
    force: false
  });

  const loadData = async (): Promise<void> => {
    try {
        const [empRes, shiftRes] = await Promise.all([
            employeeService.getEmployees({ pageSize: 1000 }), 
            attendanceService.getShifts()
        ]);
        setEmployees(empRes.items || []);
        setShifts(shiftRes as Shift[]);
    } catch (e) {
        logger.error('Failed to load data', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
        loadData();
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await attendanceService.createSchedule({
        employeeId: Number(formData.employeeId),
        shiftId: Number(formData.shiftId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        force: formData.force
      });
      toast.success('排班创建成功');
      onSuccess();
      onClose();
    } catch (err) {
      logger.error('Schedule creation failed', err);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error('排班冲突');
      } else {
        toast.error('创建失败');
      }
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
      title="新建排班"
      footer={footer}
      width="max-w-md"
    >
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">选择员工</label>
            <select 
                id="employeeId"
                value={formData.employeeId} 
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
            >
                <option value="">-- 请选择 --</option>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeNo})
                    </option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700">选择班次</label>
            <select 
                id="shiftId"
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
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">开始日期</label>
                <input 
                    id="startDate"
                    type="date" 
                    value={formData.startDate} 
                    max={formData.endDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
                />
            </div>
            <div className="space-y-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">结束日期</label>
                <input 
                    id="endDate"
                    type="date" 
                    value={formData.endDate} 
                    min={formData.startDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    required 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
                />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox" 
                    id="force"
                    checked={formData.force}
                    onChange={e => setFormData({...formData, force: e.target.checked})}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="force" className="text-sm font-medium text-gray-700 cursor-pointer">
                    强制覆盖 (忽略冲突)
                </label>
            </div>
            {formData.force && (
                <div className="text-xs text-amber-500 ml-6">
                    注意：存在跨天重叠时，新排班将优先，自动覆盖旧排班的重叠部分。
                </div>
            )}
          </div>
        </div>
    </StandardModal>
  );
};
