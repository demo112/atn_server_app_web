import React, { useState, useEffect } from 'react';
import { TimePeriod } from '@attendance/shared';
import { createTimePeriod, updateTimePeriod } from '@/services/time-period';
import { useToast } from '@/components/common/ToastProvider';
import { logger } from '@/utils/logger';
import StandardModal from '@/components/common/StandardModal';

interface TimePeriodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: TimePeriod;
}

export const TimePeriodDialog: React.FC<TimePeriodDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialData 
}): React.ReactElement | null => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 0, // 0:固定, 1:弹性
    startTime: '',
    endTime: '',
    restStartTime: '',
    restEndTime: '',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        restStartTime: initialData.restStartTime || '',
        restEndTime: initialData.restEndTime || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        type: 0,
        startTime: '',
        endTime: '',
        restStartTime: '',
        restEndTime: '',
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
        restStartTime: formData.restStartTime || undefined,
        restEndTime: formData.restEndTime || undefined,
      };

      if (initialData) {
        await updateTimePeriod(initialData.id, data);
        toast.success('更新成功');
      } else {
        await createTimePeriod(data);
        toast.success('创建成功');
      }
      onSuccess();
      onClose();
    } catch (error) {
      logger.error('Failed to save time period', error);
      toast.error('保存失败');
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
        {loading ? '提交中...' : '确定'}
      </button>
    </>
  );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑时间段' : '新建时间段'}
      footer={footer}
      width="max-w-md"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">名称 <span className="text-red-500">*</span></label>
          <input 
            id="name"
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">类型 <span className="text-red-500">*</span></label>
          <select 
            id="type"
            value={formData.type} 
            onChange={e => setFormData({...formData, type: Number(e.target.value)})}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
          >
            <option value={0}>固定班制</option>
            <option value={1}>弹性班制</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">上班时间 {formData.type === 0 && <span className="text-red-500">*</span>}</label>
            <input 
              id="startTime"
              type="time" 
              value={formData.startTime} 
              onChange={e => setFormData({...formData, startTime: e.target.value})}
              required={formData.type === 0}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">下班时间 {formData.type === 0 && <span className="text-red-500">*</span>}</label>
            <input 
              id="endTime"
              type="time" 
              value={formData.endTime} 
              onChange={e => setFormData({...formData, endTime: e.target.value})}
              required={formData.type === 0}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="restStartTime" className="block text-sm font-medium text-gray-700">午休开始</label>
            <input 
              id="restStartTime"
              type="time" 
              value={formData.restStartTime} 
              onChange={e => setFormData({...formData, restStartTime: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="restEndTime" className="block text-sm font-medium text-gray-700">午休结束</label>
            <input 
              id="restEndTime"
              type="time" 
              value={formData.restEndTime} 
              onChange={e => setFormData({...formData, restEndTime: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
            />
          </div>
        </div>
      </div>
    </StandardModal>
  );
};