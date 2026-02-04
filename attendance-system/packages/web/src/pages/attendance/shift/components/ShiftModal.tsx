import React, { useState, useEffect } from 'react';
import { Shift, ShiftTimeConfig } from '../types';
import StandardModal from '../../../../components/common/StandardModal';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shift: Shift) => void;
  initialData?: Shift | null;
}

const DEFAULT_TIME_CONFIG: ShiftTimeConfig = {
  clockIn: '09:00',
  clockOut: '18:00',
  validFromStart: '08:00',
  validFromEnd: '10:00',
  validUntilStart: '17:00',
  validUntilEnd: '19:00',
  isClockInMandatory: true,
  isClockOutMandatory: true,
};

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onConfirm, initialData }) => {
  const [name, setName] = useState('');
  const [checkins, setCheckins] = useState<1 | 2 | 3>(1);
  const [times, setTimes] = useState<ShiftTimeConfig[]>([DEFAULT_TIME_CONFIG]);
  const [lateGrace, setLateGrace] = useState(0);
  const [earlyLeaveGrace, setEarlyLeaveGrace] = useState(0);
  const [markNoCheckIn, setMarkNoCheckIn] = useState<'Absent' | 'Late' | 'No Penalty'>('Absent');
  const [markNoCheckOut, setMarkNoCheckOut] = useState<'Absent' | 'Early Leave' | 'No Penalty'>('Absent');

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setCheckins(initialData.dailyCheckins as 1 | 2 | 3);
      setTimes(initialData.times);
      setLateGrace(initialData.lateGracePeriod || 0);
      setEarlyLeaveGrace(initialData.earlyLeaveGracePeriod || 0);
      setMarkNoCheckIn(initialData.markAbsentIfNoCheckIn as any || 'Absent');
      setMarkNoCheckOut(initialData.markAbsentIfNoCheckOut as any || 'Absent');
    } else if (isOpen && !initialData) {
      // Reset
      setName('');
      setCheckins(1);
      setTimes([DEFAULT_TIME_CONFIG]);
      setLateGrace(0);
      setEarlyLeaveGrace(0);
      setMarkNoCheckIn('Absent');
      setMarkNoCheckOut('Absent');
    }
  }, [isOpen, initialData]);

  const handleCheckinChange = (val: 1 | 2 | 3) => {
    setCheckins(val);
    const newTimes = Array(val).fill(null).map((_, i) => times[i] || DEFAULT_TIME_CONFIG);
    setTimes(newTimes);
  };

  const updateTime = (index: number, field: keyof ShiftTimeConfig, value: any) => {
    const updated = [...times];
    updated[index] = { ...updated[index], [field]: value };
    setTimes(updated);
  };

  const handleConfirm = () => {
    if (!name.trim()) return; // Simple validation
    
    const newShift: Shift = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      name,
      dailyCheckins: checkins,
      times,
      lateGracePeriod: lateGrace,
      earlyLeaveGracePeriod: earlyLeaveGrace,
      markAbsentIfNoCheckIn: markNoCheckIn,
      markAbsentIfNoCheckOut: markNoCheckOut,
    };
    onConfirm(newShift);
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑班次' : '新增班次'}
    >
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="space-y-8">
            {/* Basic Info */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    <span className="text-red-500 mr-1">*</span>班次名称
                </label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例如：早班"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                </div>
                <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">每日打卡次数</label>
                <div className="flex items-center space-x-6 py-2">
                    {[1, 2, 3].map((num) => (
                    <label key={num} className="flex items-center space-x-2 cursor-pointer group">
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${checkins === num ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white dark:bg-slate-800 group-hover:border-blue-400'}`}>
                        {checkins === num && <span className="w-2 h-2 bg-white rounded-full"></span>}
                        </span>
                        <input 
                        type="radio" 
                        className="hidden" 
                        checked={checkins === num} 
                        onChange={() => handleCheckinChange(num as 1 | 2 | 3)} 
                        />
                        <span className={`text-sm ${checkins === num ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                        {num} 次
                        </span>
                    </label>
                    ))}
                </div>
                </div>
            </div>
            </div>

            {/* Sessions Configuration */}
            {times.map((time, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-blue-200 dark:hover:border-blue-900/40">
                <div className="flex items-start space-x-6">
                  <div className="mt-1 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-full min-h-[20px]"></div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Clock In */}
                      <div className="flex items-center space-x-4">
                        <label className="w-24 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">
                          <span className="text-rose-500 mr-1">*</span>Check-in
                        </label>
                        <div className="flex-1 flex items-center space-x-3">
                          <input 
                            required
                            aria-label={`Session ${index + 1} Check-in`}
                            type="time"
                            value={time.clockIn}
                            onChange={(e) => updateTime(index, 'clockIn', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <label className="flex items-center space-x-2 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={time.isClockInMandatory}
                              onChange={(e) => updateTime(index, 'isClockInMandatory', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-500">Required</span>
                          </label>
                        </div>
                      </div>
                      
                      {/* Clock Out */}
                      <div className="flex items-center space-x-4">
                        <label className="w-24 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">
                          <span className="text-rose-500 mr-1">*</span>Check-out
                        </label>
                        <div className="flex-1 flex items-center space-x-3">
                          <input 
                            required
                            aria-label={`Session ${index + 1} Check-out`}
                            type="time"
                            value={time.clockOut}
                            onChange={(e) => updateTime(index, 'clockOut', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <label className="flex items-center space-x-2 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={time.isClockOutMandatory}
                              onChange={(e) => updateTime(index, 'isClockOutMandatory', e.target.checked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-500">Required</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Valid Ranges */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-in Window</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="time" 
                            value={time.validFromStart}
                            onChange={(e) => updateTime(index, 'validFromStart', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          <span className="text-slate-400">-</span>
                          <input 
                            type="time" 
                            value={time.validFromEnd}
                            onChange={(e) => updateTime(index, 'validFromEnd', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Check-out Window</label>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="time" 
                            value={time.validUntilStart}
                            onChange={(e) => updateTime(index, 'validUntilStart', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                          <span className="text-slate-400">-</span>
                          <input 
                            type="time" 
                            value={time.validUntilEnd}
                            onChange={(e) => updateTime(index, 'validUntilEnd', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Advanced Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
                <span className="w-1 h-4 bg-blue-500 rounded-full mr-2"></span>
                Late & Absence Rules
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Late Grace Period (mins)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={lateGrace}
                      onChange={(e) => setLateGrace(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">No Check-in Rule</label>
                    <select 
                      value={markNoCheckIn}
                      onChange={(e) => setMarkNoCheckIn(e.target.value as any)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Absent">Mark as Absent</option>
                      <option value="Late">Mark as Late</option>
                      <option value="No Penalty">No Penalty</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Early Leave Grace (mins)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={earlyLeaveGrace}
                      onChange={(e) => setEarlyLeaveGrace(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">No Check-out Rule</label>
                    <select 
                      value={markNoCheckOut}
                      onChange={(e) => setMarkNoCheckOut(e.target.value as any)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Absent">Mark as Absent</option>
                      <option value="Early Leave">Mark as Early Leave</option>
                      <option value="No Penalty">No Penalty</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-95 transition-all"
              >
                Save Shift
              </button>
            </div>
        </form>
      </div>
    </StandardModal>
  );
};

export default ShiftModal;
