import React, { useEffect, useState } from 'react';
import * as correctionService from '@/services/correction';
import dayjs from 'dayjs';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/common/ToastProvider';

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dailyRecordId: string;
  employeeName?: string;
  workDate?: string;
}

export const CheckInDialog: React.FC<CheckInDialogProps> = ({ 
  isOpen, onClose, onSuccess, dailyRecordId 
}): React.ReactElement | null => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [remark, setRemark] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Default to now, formatted for datetime-local (YYYY-MM-DDTHH:mm)
      setCheckInTime(dayjs().format('YYYY-MM-DDTHH:mm'));
      setRemark('');
    }
  }, [isOpen]);

  const handleSubmit = async (): Promise<void> => {
    try {
      if (!checkInTime) {
        error('请选择签到时间');
        return;
      }
      setLoading(true);

      await correctionService.supplementCheckIn({
        dailyRecordId,
        checkInTime: new Date(checkInTime).toISOString(),
        remark
      });
      
      success('补签到成功');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      logger.error('CheckIn failed', err);
      error('补签失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={onClose} />
      <div className="bg-white w-full max-w-[520px] rounded-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200 relative">
        {/* Header */}
        <div className="bg-primary text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-xl">edit_calendar</span>
            <h3 className="font-semibold text-base tracking-wide">补签申请</h3>
          </div>
          <button className="p-1 hover:bg-white/20 rounded-full transition-colors" onClick={onClose}>
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* DateTime Picker */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center">
              <span className="text-red-500 mr-1">*</span>
              补签到时间：
            </label>
            <div className="relative group">
              <input 
                type="datetime-local"
                className="w-full border-slate-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white border"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
          </div>

          {/* Remark Field */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-700">备注</label>
            <textarea
              rows={2}
              className="w-full border-slate-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white border resize-none"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="请输入补签原因..."
            />
          </div>

          {/* Alert Box */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-md flex items-start space-x-3">
            <span className="material-icons text-blue-500 text-lg mt-0.5">info</span>
            <div className="space-y-1">
              <p className="text-xs text-blue-700 font-semibold leading-relaxed">温馨提示：</p>
              <p className="text-xs text-blue-600/80 leading-relaxed">
                补签申请提交后，系统将自动重新计算考勤结果。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
          <button 
            className="px-8 py-2 border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400 rounded-md text-sm font-medium transition-all"
            onClick={onClose}
          >
            取消
          </button>
          <button 
            className="px-8 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium shadow-sm transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '提交中...' : '确认提交'}
          </button>
        </div>
      </div>
    </div>
  );
};
