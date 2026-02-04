
import React, { useState, useEffect } from 'react';
import { ModalType, AttendanceRecord } from '../types';

interface CorrectionModalProps {
  type: ModalType;
  record: AttendanceRecord | null;
  onClose: () => void;
  onConfirm: (data: { time: string }) => void;
}

const CorrectionModal: React.FC<CorrectionModalProps> = ({ type, record, onClose, onConfirm }) => {
  const [selectedTime, setSelectedTime] = useState('');

  // Helper to convert '2026/01/14' + '09:00' to '2026-01-14T09:00'
  const formatInitialValue = (dateStr: string, defaultTime: string) => {
    const isoDate = dateStr.replace(/\//g, '-');
    return `${isoDate}T${defaultTime}`;
  };

  useEffect(() => {
    if (record && type) {
      const defaultTime = type === 'in' ? '09:00' : '17:00';
      setSelectedTime(formatInitialValue(record.workday, defaultTime));
    }
  }, [record, type]);

  if (!type || !record) return null;

  const handleSubmit = () => {
    onConfirm({ time: selectedTime });
  };

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
              {type === 'in' ? '补签到时间：' : '补签退时间：'}
            </label>
            <div className="relative group">
              <input 
                type="datetime-local"
                className="w-full border-slate-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-white"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
          </div>

          {/* Alert Box */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-md flex items-start space-x-3">
            <span className="material-icons text-blue-500 text-lg mt-0.5">info</span>
            <div className="space-y-1">
              <p className="text-xs text-blue-700 font-semibold leading-relaxed">温馨提示：</p>
              <p className="text-xs text-blue-600/80 leading-relaxed">
                补签申请提交后，请联系部门主管及时审批。请假/补签操作不会自动计算考勤，请到“考勤明细”界面手动刷新计算。
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
            className="px-8 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium shadow-sm transition-all flex items-center"
            onClick={handleSubmit}
          >
            确认提交
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrectionModal;
