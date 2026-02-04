import React, { useEffect, useState } from 'react';
import { LeaveType, LeaveVo } from '@attendance/shared';
import * as leaveService from '@/services/attendance/leave';
import dayjs from 'dayjs';
import { useToast } from '@/components/common/ToastProvider';
import { logger } from '@/utils/logger';
import StandardModal from '@/components/common/StandardModal';

interface LeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: LeaveVo;
}

export const LeaveDialog: React.FC<LeaveDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialData 
}): React.ReactElement => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    type: LeaveType.annual as LeaveType,
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          employeeId: initialData.employeeId.toString(),
          type: initialData.type,
          startTime: dayjs(initialData.startTime).format('YYYY-MM-DDTHH:mm'),
          endTime: dayjs(initialData.endTime).format('YYYY-MM-DDTHH:mm'),
          reason: initialData.reason || ''
        });
      } else {
        setFormData({
          employeeId: '',
          type: LeaveType.annual,
          startTime: '',
          endTime: '',
          reason: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.employeeId || !formData.startTime || !formData.endTime) {
        toast.warning('请填写必填项');
        return;
      }

      setLoading(true);

      const payload = {
        employeeId: Number(formData.employeeId),
        type: formData.type,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        reason: formData.reason
      };

      if (initialData) {
        toast.warning('编辑功能暂未开放');
        return;
      } else {
        await leaveService.createLeave({
          ...payload,
          operatorId: 0 // Backend injects
        });
        toast.success('创建成功');
      }
      
      onSuccess();
      onClose();
    } catch (err: unknown) {
      logger.error('Leave submit failed', err);
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-6">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        取消
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors disabled:opacity-50"
      >
        {loading ? '提交中...' : '确定'}
      </button>
    </div>
  );

  return (
    <StandardModal
      title={initialData ? "编辑请假" : "申请请假"}
      isOpen={isOpen}
      onClose={onClose}
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            员工ID <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            placeholder="请输入员工ID"
            value={formData.employeeId}
            disabled={!!initialData}
            onChange={e => setFormData({...formData, employeeId: e.target.value})}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            请假类型 <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as LeaveType})}
            required
          >
            <option value={LeaveType.annual}>年假</option>
            <option value={LeaveType.sick}>病假</option>
            <option value={LeaveType.personal}>事假</option>
            <option value={LeaveType.business_trip}>出差</option>
            <option value={LeaveType.other}>其他</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              value={formData.startTime}
              onChange={e => setFormData({...formData, startTime: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              value={formData.endTime}
              onChange={e => setFormData({...formData, endTime: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            事由
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            placeholder="请输入请假/出差事由"
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
          />
        </div>
      </form>
    </StandardModal>
  );
};
