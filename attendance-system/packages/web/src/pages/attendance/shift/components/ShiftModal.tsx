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
};

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onConfirm, initialData }) => {
  const [name, setName] = useState('');
  const [checkins, setCheckins] = useState<1 | 2 | 3>(1);
  const [times, setTimes] = useState<ShiftTimeConfig[]>([DEFAULT_TIME_CONFIG]);
  const [lateGrace, setLateGrace] = useState(0);
  const [earlyLeaveGrace, setEarlyLeaveGrace] = useState(0);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setCheckins(initialData.dailyCheckins as 1 | 2 | 3);
      setTimes(initialData.times);
      setLateGrace(initialData.lateGracePeriod || 0);
      setEarlyLeaveGrace(initialData.earlyLeaveGracePeriod || 0);
    } else if (isOpen && !initialData) {
      // Reset
      setName('');
      setCheckins(1);
      setTimes([DEFAULT_TIME_CONFIG]);
      setLateGrace(0);
      setEarlyLeaveGrace(0);
    }
  }, [isOpen, initialData]);

  const handleCheckinChange = (val: 1 | 2 | 3) => {
    setCheckins(val);
    const newTimes = Array(val).fill(null).map((_, i) => times[i] || DEFAULT_TIME_CONFIG);
    setTimes(newTimes);
  };

  const updateTime = (index: number, field: keyof ShiftTimeConfig, value: string) => {
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
      markAbsentIfNoCheckIn: 'Absent',
      markAbsentIfNoCheckOut: 'Absent',
    };
    onConfirm(newShift);
  };

  const footer = (
    <>
      <button 
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        取消
      </button>
      <button 
        onClick={handleConfirm}
        className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded text-sm font-medium shadow-sm transition-colors"
      >
        确定
      </button>
    </>
  );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '编辑班次' : '新增班次'}
      footer={footer}
    >
      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <span className="text-red-500 mr-1">*</span>班次名称
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：早班"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">每日打卡次数</label>
              <div className="flex items-center space-x-6 py-2">
                {[1, 2, 3].map((num) => (
                  <label key={num} className="flex items-center space-x-2 cursor-pointer group">
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${checkins === num ? 'border-primary bg-primary' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                      {checkins === num && <span className="w-2 h-2 bg-white rounded-full"></span>}
                    </span>
                    <input 
                      type="radio" 
                      className="hidden" 
                      checked={checkins === num} 
                      onChange={() => handleCheckinChange(num as 1 | 2 | 3)} 
                    />
                    <span className={`text-sm ${checkins === num ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                      {num} 次
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Configuration */}
        <div className="space-y-4">
          {times.map((time, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-100 relative group hover:border-blue-200 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-primary flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  {index < times.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                </div>
                
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Clock In */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">上班</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="time" 
                        value={time.clockIn}
                        onChange={(e) => updateTime(index, 'clockIn', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="text-gray-400">范围：</span>
                      <div className="flex items-center space-x-2 flex-[2]">
                        <input 
                          type="time" 
                          value={time.validFromStart}
                          onChange={(e) => updateTime(index, 'validFromStart', e.target.value)}
                          className="w-full px-2 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none"
                        />
                        <span className="text-gray-400">~</span>
                        <input 
                          type="time" 
                          value={time.validFromEnd}
                          onChange={(e) => updateTime(index, 'validFromEnd', e.target.value)}
                          className="w-full px-2 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clock Out */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">下班</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="time" 
                        value={time.clockOut}
                        onChange={(e) => updateTime(index, 'clockOut', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="text-gray-400">范围：</span>
                      <div className="flex items-center space-x-2 flex-[2]">
                        <input 
                          type="time" 
                          value={time.validUntilStart}
                          onChange={(e) => updateTime(index, 'validUntilStart', e.target.value)}
                          className="w-full px-2 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none"
                        />
                        <span className="text-gray-400">~</span>
                        <input 
                          type="time" 
                          value={time.validUntilEnd}
                          onChange={(e) => updateTime(index, 'validUntilEnd', e.target.value)}
                          className="w-full px-2 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-1 h-4 bg-primary rounded-full mr-2"></span>
            迟到与缺勤规则
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">允许迟到时长 (分钟)</label>
                <input 
                  type="number" 
                  value={lateGrace}
                  onChange={(e) => setLateGrace(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">允许早退时长 (分钟)</label>
                <input 
                  type="number" 
                  value={earlyLeaveGrace}
                  onChange={(e) => setEarlyLeaveGrace(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StandardModal>
  );
};

export default ShiftModal;
