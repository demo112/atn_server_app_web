
import React, { useState } from 'react';
import { Shift } from '../types';

interface AddShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shift: Omit<Shift, 'id'>) => void;
}

const AddShiftModal: React.FC<AddShiftModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm({ name, startTime, endTime });
      setName('');
      setStartTime('09:00');
      setEndTime('18:00');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <span className="material-icons">more_time</span>
            <h2 className="text-xl font-bold tracking-tight">Create New Shift</h2>
          </div>
          <button 
            className="hover:bg-white/20 p-1.5 rounded-full transition-colors active:scale-90" 
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="shift-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="text-rose-500 mr-1">*</span>Shift Name
                </label>
                <input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
                  placeholder="e.g. Afternoon Support Shift" 
                  type="text"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Sessions Per Day</label>
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {['1 Session', '2 Sessions', '3 Sessions'].map((label, idx) => (
                    <label key={label} className="flex-1 text-center cursor-pointer">
                      <input 
                        type="radio" 
                        name="shift_count" 
                        className="peer hidden" 
                        defaultChecked={idx === 0} 
                      />
                      <span className="block py-1.5 px-3 text-sm rounded-lg peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 peer-checked:shadow-sm transition-all text-slate-500 dark:text-slate-400 font-medium">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Session 1 Configuration */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-blue-200 dark:hover:border-blue-900/40">
              <div className="flex items-start space-x-6">
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">01</div>
                  <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex items-center space-x-4">
                      <label className="w-24 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">
                        <span className="text-rose-500 mr-1">*</span>Check-in
                      </label>
                      <div className="flex-1 flex items-center space-x-3">
                        <input 
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 border-slate-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                          type="time" 
                        />
                        <label className="flex items-center text-xs whitespace-nowrap text-slate-500 cursor-pointer">
                          <input defaultChecked className="rounded text-blue-600 mr-1.5 focus:ring-blue-500" type="checkbox"/> 
                          Mandatory
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="w-32 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">
                        <span className="text-rose-500 mr-1">*</span>Valid Range
                      </label>
                      <div className="flex-1 flex items-center space-x-2">
                        <input className="w-full px-2 py-2 border-slate-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-sm" type="time" defaultValue="08:30"/>
                        <span className="text-slate-400">~</span>
                        <input className="w-full px-2 py-2 border-slate-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-sm" type="time" defaultValue="09:30"/>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex items-center space-x-4">
                      <label className="w-24 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">
                        <span className="text-rose-500 mr-1">*</span>Check-out
                      </label>
                      <div className="flex-1 flex items-center space-x-3">
                        <input 
                          required
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 border-slate-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                          type="time" 
                        />
                        <label className="flex items-center text-xs whitespace-nowrap text-slate-500 cursor-pointer">
                          <input defaultChecked className="rounded text-blue-600 mr-1.5 focus:ring-blue-500" type="checkbox"/> 
                          Mandatory
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="w-32 text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">
                        <span className="text-rose-500 mr-1">*</span>Valid Range
                      </label>
                      <div className="flex-1 flex items-center space-x-2">
                        <input className="w-full px-2 py-2 border-slate-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-sm" type="time" defaultValue="17:30"/>
                        <span className="text-slate-400">~</span>
                        <input className="w-full px-2 py-2 border-slate-300 dark:border-slate-700 dark:bg-slate-900 rounded-lg text-sm" type="time" defaultValue="18:30"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Absence Rules Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Absence Rules</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Allow Late Arrival
                    <span className="material-icons text-xs ml-1.5 text-slate-400 cursor-help" title="Grace period for late check-in">help_outline</span>
                  </label>
                  <div className="flex items-center group">
                    <input className="flex-1 border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-l-xl focus:ring-blue-500 focus:border-blue-500 h-10 px-4 transition-all" type="number" defaultValue="0"/>
                    <span className="h-10 flex items-center px-4 bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-300 dark:border-slate-700 rounded-r-xl text-xs font-bold text-slate-500 uppercase">Min</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Allow Early Departure
                    <span className="material-icons text-xs ml-1.5 text-slate-400 cursor-help" title="Grace period for early check-out">help_outline</span>
                  </label>
                  <div className="flex items-center group">
                    <input className="flex-1 border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-l-xl focus:ring-blue-500 focus:border-blue-500 h-10 px-4 transition-all" type="number" defaultValue="0"/>
                    <span className="h-10 flex items-center px-4 bg-slate-100 dark:bg-slate-700 border border-l-0 border-slate-300 dark:border-slate-700 rounded-r-xl text-xs font-bold text-slate-500 uppercase">Min</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No Check-in Treated As</label>
                  <select className="w-full border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl h-10 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    <option>Absence</option>
                    <option>Late Arrival</option>
                    <option>Paid Leave</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No Check-out Treated As</label>
                  <select className="w-full border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-xl h-10 px-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                    <option>Absence</option>
                    <option>Early Departure</option>
                    <option>Paid Leave</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 flex justify-end space-x-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <button 
            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            form="shift-form"
            type="submit"
            className="px-10 py-2.5 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddShiftModal;
