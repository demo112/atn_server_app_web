
import React, { useState, useEffect } from 'react';
import { LeaveType, LeaveSubType, LeaveRequest } from '../types';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Partial<LeaveRequest>) => void;
  initialData?: Partial<LeaveRequest>;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    type: LeaveType.LEAVE,
    subType: LeaveSubType.SICK,
    startTime: '2026-02-04 09:00',
    endTime: '2026-02-04 18:00',
    note: '',
    duration: 540
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      applyTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: 'approved',
      employeeId: initialData?.employeeId || '6CS9Nu',
      employeeName: initialData?.employeeName || 'atnd01_dev',
      department: initialData?.department || '研发部'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h3 className="text-lg font-semibold">{initialData?.id ? '编辑' : '添加'}请假/出差</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <span className="material-icons-round">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>请假人员:
            </label>
            <div className="md:col-span-3">
              <input 
                className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed" 
                disabled 
                type="text" 
                value={initialData?.employeeName || 'atnd01_dev'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>请假主类型:
            </label>
            <div className="md:col-span-3">
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as LeaveType })}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-primary focus:border-primary"
              >
                <option value={LeaveType.LEAVE}>请假</option>
                <option value={LeaveType.TRIP}>出差</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">子类型:</label>
            <div className="md:col-span-3">
              <select 
                value={formData.subType}
                onChange={e => setFormData({ ...formData, subType: e.target.value as LeaveSubType })}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-primary focus:border-primary"
              >
                <option value={LeaveSubType.PERSONAL}>事假</option>
                <option value={LeaveSubType.SICK}>病假</option>
                <option value={LeaveSubType.ANNUAL}>年假</option>
                <option value={LeaveSubType.OTHER}>其他</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>请假开始时间:
            </label>
            <div className="md:col-span-3 relative">
              <input 
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-primary focus:border-primary pr-10" 
                type="text"
              />
              <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">calendar_month</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">
              <span className="text-red-500 mr-1">*</span>请假结束时间:
            </label>
            <div className="md:col-span-3 relative">
              <input 
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-primary focus:border-primary pr-10" 
                type="text"
              />
              <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">calendar_month</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
            <label className="md:text-right font-medium text-slate-700 dark:text-slate-300">时长(分钟):</label>
            <div className="md:col-span-3">
              <input 
                className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500" 
                disabled 
                type="text" 
                value={formData.duration}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4">
            <label className="md:text-right font-medium pt-2 text-slate-700 dark:text-slate-300">备注:</label>
            <div className="md:col-span-3">
              <textarea 
                value={formData.note}
                onChange={e => setFormData({ ...formData, note: e.target.value })}
                className="w-full border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 focus:ring-primary focus:border-primary" 
                placeholder="请输入备注信息..." 
                rows={3}
              ></textarea>
            </div>
          </div>

          <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
            提示：请假/补签操作不会自动计算考勤，请到“考勤明细”界面进行手动计算
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-8 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all font-medium"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
