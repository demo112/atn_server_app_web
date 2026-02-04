
import React, { useState, useEffect } from 'react';
import { LeaveType as SharedLeaveType, LeaveVo } from '@attendance/shared';
import { LeaveTypeUI, LeaveSubTypeUI } from '../types_ui';
import { useToast } from '@/components/common/ToastProvider';
import * as leaveService from '@/services/leave';
import { logger } from '@/utils/logger';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: LeaveVo;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [uiType, setUiType] = useState<LeaveTypeUI>(LeaveTypeUI.LEAVE);
  const [uiSubType, setUiSubType] = useState<LeaveSubTypeUI>(LeaveSubTypeUI.SICK);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Map SharedType back to UI Type/SubType
        if (initialData.type === SharedLeaveType.business_trip) {
          setUiType(LeaveTypeUI.TRIP);
          setUiSubType(LeaveSubTypeUI.OTHER); // Default or irrelevant
        } else {
          setUiType(LeaveTypeUI.LEAVE);
          // Map shared type string to UI enum
          // simple mapping for demo
          switch (initialData.type) {
            case SharedLeaveType.sick: setUiSubType(LeaveSubTypeUI.SICK); break;
            case SharedLeaveType.annual: setUiSubType(LeaveSubTypeUI.ANNUAL); break;
            case SharedLeaveType.personal: setUiSubType(LeaveSubTypeUI.PERSONAL); break;
            default: setUiSubType(LeaveSubTypeUI.OTHER);
          }
        }

        setFormData({
          employeeId: String(initialData.employeeId),
          startTime: initialData.startTime.slice(0, 16), // simple iso to datetime-local
          endTime: initialData.endTime.slice(0, 16),
          reason: initialData.reason || ''
        });
      } else {
        // Reset
        setUiType(LeaveTypeUI.LEAVE);
        setUiSubType(LeaveSubTypeUI.SICK);
        setFormData({
          employeeId: '1', // Default or get from context
          startTime: '',
          endTime: '',
          reason: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Map UI Type to Shared Type
      let finalType: SharedLeaveType;
      if (uiType === LeaveTypeUI.TRIP) {
        finalType = SharedLeaveType.business_trip;
      } else {
        switch (uiSubType) {
          case LeaveSubTypeUI.SICK: finalType = SharedLeaveType.sick; break;
          case LeaveSubTypeUI.ANNUAL: finalType = SharedLeaveType.annual; break;
          case LeaveSubTypeUI.PERSONAL: finalType = SharedLeaveType.personal; break;
          default: finalType = SharedLeaveType.other;
        }
      }

      const payload = {
        employeeId: Number(formData.employeeId),
        type: finalType,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        reason: formData.reason
      };

      if (initialData) {
        toast.warning('编辑功能暂未对接 API');
        // await leaveService.updateLeave(initialData.id, payload);
      } else {
        await leaveService.createLeave(payload);
        toast.success('提交成功');
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      logger.error('Failed to submit leave', err);
      toast.error('提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h3 className="text-lg font-semibold">{initialData ? '编辑' : '添加'}请假/出差</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>员工ID:
            </label>
            <div className="md:col-span-3">
              <input 
                className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg p-2" 
                type="text" 
                required
                value={formData.employeeId}
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>请假主类型:
            </label>
            <div className="md:col-span-3">
              <select 
                value={uiType}
                onChange={e => setUiType(e.target.value as LeaveTypeUI)}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 p-2 focus:ring-primary focus:border-primary"
              >
                <option value={LeaveTypeUI.LEAVE}>请假</option>
                <option value={LeaveTypeUI.TRIP}>出差</option>
              </select>
            </div>
          </div>

          {uiType === LeaveTypeUI.LEAVE && (
            <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
              <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">子类型:</label>
              <div className="md:col-span-3">
                <select 
                  value={uiSubType}
                  onChange={e => setUiSubType(e.target.value as LeaveSubTypeUI)}
                  className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 p-2 focus:ring-primary focus:border-primary"
                >
                  <option value={LeaveSubTypeUI.PERSONAL}>事假</option>
                  <option value={LeaveSubTypeUI.SICK}>病假</option>
                  <option value={LeaveSubTypeUI.ANNUAL}>年假</option>
                  <option value={LeaveSubTypeUI.OTHER}>其他</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>开始时间:
            </label>
            <div className="md:col-span-3">
              <input 
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 p-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>结束时间:
            </label>
            <div className="md:col-span-3">
              <input 
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 p-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300 pt-2">备注:</label>
            <div className="md:col-span-3">
              <textarea 
                rows={3}
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 p-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? '提交中...' : '提交申请'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
