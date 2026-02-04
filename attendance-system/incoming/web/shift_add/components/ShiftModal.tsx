
import React, { useState } from 'react';
import { Shift, ShiftTimeConfig } from '../types';

interface ShiftModalProps {
  onClose: () => void;
  onConfirm: (shift: Shift) => void;
}

const DEFAULT_TIME_CONFIG: ShiftTimeConfig = {
  clockIn: '09:00',
  clockOut: '17:00',
  isClockInMandatory: true,
  isClockOutMandatory: true,
  validFromStart: '08:30',
  validFromEnd: '09:30',
  validUntilStart: '16:30',
  validUntilEnd: '17:30',
};

const ShiftModal: React.FC<ShiftModalProps> = ({ onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [checkins, setCheckins] = useState<1 | 2 | 3>(1);
  const [times, setTimes] = useState<ShiftTimeConfig[]>([DEFAULT_TIME_CONFIG]);
  const [lateGrace, setLateGrace] = useState(0);
  const [earlyLeaveGrace, setEarlyLeaveGrace] = useState(0);
  const [markNoCheckIn, setMarkNoCheckIn] = useState<'Absent' | 'Late' | 'No Penalty'>('Absent');
  const [markNoCheckOut, setMarkNoCheckOut] = useState<'Absent' | 'Early Leave' | 'No Penalty'>('Absent');

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
    if (!name) return alert('Please enter shift name');
    const newShift: Shift = {
      id: Math.random().toString(36).substr(2, 9),
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold">Add New Shift</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-1">*</span>Shift Name
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary text-sm"
                  placeholder="Please enter"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Daily Check-ins</label>
                <div className="flex items-center space-x-6 py-2">
                  {[1, 2, 3].map((num) => (
                    <label key={num} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={checkins === num}
                        onChange={() => handleCheckinChange(num as 1 | 2 | 3)}
                        className="text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-sm">{num} Time{num > 1 ? 's' : ''}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-8 border border-gray-100">
              {times.map((time, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-sm font-semibold text-gray-400 min-w-[100px] pt-1">
                      {idx === 0 ? 'First Time' : idx === 1 ? 'Second Time' : 'Third Time'}
                    </span>
                    <div className="flex-1 space-y-4">
                      {/* Clock In Row */}
                      <div className="flex items-center flex-wrap gap-x-8 gap-y-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-500">*</span>
                          <span className="text-sm w-16">Clock-in</span>
                          <div className="relative">
                            <input
                              className="w-28 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary"
                              type="text"
                              value={time.clockIn}
                              onChange={(e) => updateTime(idx, 'clockIn', e.target.value)}
                            />
                            <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-base pointer-events-none">schedule</span>
                          </div>
                        </div>
                        <label className="flex items-center space-x-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={time.isClockInMandatory}
                            onChange={(e) => updateTime(idx, 'isClockInMandatory', e.target.checked)}
                            className="rounded text-primary focus:ring-primary border-gray-300"
                          />
                          <span>Mandatory</span>
                        </label>
                        <div className="flex items-center space-x-2 lg:ml-auto">
                          <span className="text-red-500">*</span>
                          <span className="text-sm whitespace-nowrap">Valid From</span>
                          <div className="relative">
                            <input
                              className="w-28 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded"
                              type="text"
                              value={time.validFromStart}
                              onChange={(e) => updateTime(idx, 'validFromStart', e.target.value)}
                            />
                            <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-base pointer-events-none">schedule</span>
                          </div>
                          <span className="text-gray-400">~</span>
                          <div className="relative">
                            <input
                              className="w-28 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded"
                              type="text"
                              value={time.validFromEnd}
                              onChange={(e) => updateTime(idx, 'validFromEnd', e.target.value)}
                            />
                            <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-base pointer-events-none">schedule</span>
                          </div>
                        </div>
                      </div>

                      {/* Clock Out Row */}
                      <div className="flex items-center flex-wrap gap-x-8 gap-y-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-500">*</span>
                          <span className="text-sm w-16">Clock-out</span>
                          <div className="relative">
                            <input
                              className="w-28 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded"
                              type="text"
                              value={time.clockOut}
                              onChange={(e) => updateTime(idx, 'clockOut', e.target.value)}
                            />
                            <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-base pointer-events-none">schedule</span>
                          </div>
                        </div>
                        <label className="flex items-center space-x-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={time.isClockOutMandatory}
                            onChange={(e) => updateTime(idx, 'isClockOutMandatory', e.target.checked)}
                            className="rounded text-primary focus:ring-primary border-gray-300"
                          />
                          <span>Mandatory</span>
                        </label>
                        <div className="flex items-center space-x-2 lg:ml-auto">
                          <span className="text-red-500">*</span>
                          <span className="text-sm whitespace-nowrap">Valid Until</span>
                          <div className="relative">
                            <input
                              className="w-28 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded"
                              type="text"
                              value={time.validUntilStart}
                              onChange={(e) => updateTime(idx, 'validUntilStart', e.target.value)}
                            />
                            <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-base pointer-events-none">schedule</span>
                          </div>
                          <span className="text-gray-400">~</span>
                          <div className="relative">
                            <input
                              className="w-28 pl-3 pr-8 py-1.5 text-sm border border-gray-300 rounded"
                              type="text"
                              value={time.validUntilEnd}
                              onChange={(e) => updateTime(idx, 'validUntilEnd', e.target.value)}
                            />
                            <span className="material-icons absolute right-2 top-1.5 text-gray-400 text-base pointer-events-none">schedule</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {idx < times.length - 1 && <hr className="border-gray-200" />}
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-l-4 border-primary pl-3">
                <h3 className="font-semibold text-gray-800">Attendance Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    <label className="text-sm font-medium">Late Grace Period</label>
                    <span className="material-icons text-sm text-gray-400 cursor-help" title="Employees are not marked late within this window">help_outline</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary text-sm"
                      type="number"
                      value={lateGrace}
                      onChange={(e) => setLateGrace(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-gray-500">Minutes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    <label className="text-sm font-medium">Early Leave Grace Period</label>
                    <span className="material-icons text-sm text-gray-400 cursor-help" title="Employees can leave this early without penalty">help_outline</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary text-sm"
                      type="number"
                      value={earlyLeaveGrace}
                      onChange={(e) => setEarlyLeaveGrace(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-gray-500">Minutes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">If not checked-in, mark as</label>
                  <select
                    value={markNoCheckIn}
                    onChange={(e) => setMarkNoCheckIn(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary text-sm bg-white"
                  >
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="No Penalty">No Penalty</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">If not checked-out, mark as</label>
                  <select
                    value={markNoCheckOut}
                    onChange={(e) => setMarkNoCheckOut(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-primary text-sm bg-white"
                  >
                    <option value="Absent">Absent</option>
                    <option value="Early Leave">Early Leave</option>
                    <option value="No Penalty">No Penalty</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-8 py-2 bg-primary hover:bg-blue-600 text-white rounded text-sm font-medium shadow-sm transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;
