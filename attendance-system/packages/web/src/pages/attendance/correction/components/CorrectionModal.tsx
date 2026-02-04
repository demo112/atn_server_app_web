import React, { useEffect, useState } from 'react';
import { CorrectionVo } from '@attendance/shared';
import dayjs from 'dayjs';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: CorrectionVo | null;
  onConfirm?: (time: string) => void;
}

const CorrectionModal: React.FC<CorrectionModalProps> = ({ isOpen, onClose, record, onConfirm }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    if (isOpen && record) {
      setTime(dayjs(record.correctionTime).format('YYYY-MM-DD HH:mm'));
    } else {
      setTime(dayjs().format('YYYY-MM-DD HH:mm'));
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(time);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span>补签申请详情</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <label className="w-24 text-sm font-semibold text-slate-600 text-right shrink-0">
              <span className="text-red-500 mr-1">*</span>
              {record?.type === 'check_out' ? '补签退' : '补签到'}:
            </label>
            <div className="flex-1 relative">
              <input 
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner outline-none" 
                type="text" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-icons text-slate-400 text-lg">calendar_today</span>
            </div>
          </div>

          <div className="ml-0 lg:ml-24">
            <div className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <span className="material-icons text-primary text-xl shrink-0 mt-0.5">info</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700 block mb-1">操作提示:</span>
                补签申请通过后，系统不会自动重新计算考勤结果。请在确认结果无误后，进入“考勤明细”界面手动执行“重算”操作。
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-center gap-4">
          <button 
            onClick={handleConfirm}
            className="px-12 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all text-sm"
          >
            确认
          </button>
          <button 
            onClick={onClose}
            className="px-12 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-sm"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrectionModal;
