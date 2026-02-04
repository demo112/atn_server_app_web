import React, { useState } from 'react';
import { MOCK_SHIFTS, MOCK_DEVICES } from '../constants';

interface SelectionModalsProps {
  type: 'personnel' | 'shift' | 'device';
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { label: '一', value: 'mon' },
  { label: '二', value: 'tue' },
  { label: '三', value: 'wed' },
  { label: '四', value: 'thu' },
  { label: '五', value: 'fri' },
  { label: '六', value: 'sat' },
  { label: '日', value: 'sun' },
];

const SelectionModals: React.FC<SelectionModalsProps> = ({ type, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copyToDays, setCopyToDays] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    if (type === 'shift') {
      // Radio-like behavior for shift usually, but let's keep it flexible
      setSelectedIds([id]);
    } else {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  const toggleCopyDay = (day: string) => {
    setCopyToDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const titles = {
    personnel: '选择人员',
    shift: '选择班次',
    device: '选择设备'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-[#409eff] px-4 py-3 text-white flex justify-between items-center">
          <span className="font-bold text-sm tracking-wide uppercase">{titles[type]}</span>
          <button className="material-icons text-xl hover:bg-white/10 rounded-full transition" onClick={onClose}>close</button>
        </div>
        
        <div className="p-6">
          {/* Personnel Selection Logic (Simplified Tree View) */}
          {type === 'personnel' && (
            <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded min-h-[400px]">
              <div className="p-4 border-r border-gray-200 flex flex-col">
                <div className="mb-4 relative">
                  <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                  <input className="w-full text-xs border-gray-200 rounded pl-8" placeholder="搜索部门或人员" type="text" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="material-icons text-xs">arrow_drop_down</span>
                    <span className="material-icons text-blue-500 text-sm">corporate_fare</span>
                    <span>公司总部</span>
                  </div>
                  <div className="pl-6 space-y-2">
                    {['技术部', '行政部', '市场部', '研发部'].map(dept => (
                      <div key={dept} className="flex items-center justify-between p-1 hover:bg-blue-50 rounded group cursor-pointer">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="material-icons text-xs group-hover:rotate-90 transition">chevron_right</span>
                          <span className="material-icons text-sm">group</span>
                          <span>{dept}</span>
                        </div>
                        <input type="checkbox" className="rounded text-blue-500 border-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col bg-gray-50">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                  <span className="text-xs font-bold text-gray-600">已选 (0)</span>
                  <button className="text-xs text-blue-500 hover:underline">清空</button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <span className="material-icons text-4xl mb-2 opacity-20">inbox</span>
                  <span className="text-xs">暂未选择任何人员</span>
                </div>
              </div>
            </div>
          )}

          {/* Shift Selection Logic */}
          {type === 'shift' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded text-xs hover:bg-gray-50 transition">
                  <span className="material-icons text-sm">add</span> 新增班次
                </button>
                <div className="relative w-48">
                  <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                  <input className="w-full pl-8 py-1 text-xs border-gray-200 rounded" placeholder="搜索班次" />
                </div>
              </div>
              <div className="border border-gray-200 rounded-md max-h-[260px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 font-bold w-12"></th>
                      <th className="px-4 py-2 font-bold">班次名称</th>
                      <th className="px-4 py-2 font-bold">班次时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_SHIFTS.map(shift => (
                      <tr 
                        key={shift.id} 
                        className={`hover:bg-blue-50 cursor-pointer ${selectedIds.includes(shift.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => toggleSelection(shift.id)}
                      >
                        <td className="px-4 py-2">
                          <input 
                            type="radio" 
                            name="shift-select" 
                            checked={selectedIds.includes(shift.id)} 
                            onChange={() => {}}
                            className="text-blue-500 border-gray-300 focus:ring-blue-500" 
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">{shift.name}</td>
                        <td className="px-4 py-2 text-gray-500">{shift.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Copy to other days feature */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-semibold text-gray-600 shrink-0">复制给其他天:</span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label key={day.value} className="flex items-center space-x-1.5 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={copyToDays.includes(day.value)}
                          onChange={() => toggleCopyDay(day.value)}
                          className="rounded text-blue-500 border-gray-300 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">周{day.label}</span>
                      </label>
                    ))}
                    <button 
                      onClick={() => setCopyToDays(copyToDays.length === 7 ? [] : DAYS_OF_WEEK.map(d => d.value))}
                      className="text-[10px] text-blue-500 hover:underline ml-2"
                    >
                      {copyToDays.length === 7 ? '取消全选' : '全选'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Device Selection Logic */}
          {type === 'device' && (
            <div className="space-y-4">
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                <input className="w-full pl-10 py-2 border-gray-200 bg-gray-50 rounded focus:ring-blue-500 text-sm" placeholder="按设备名称或SN号搜索" />
              </div>
              <div className="border border-gray-200 rounded-md max-h-[350px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 w-12">
                        <input type="checkbox" className="rounded text-blue-500 border-gray-300" />
                      </th>
                      <th className="px-4 py-3 font-bold">设备名称</th>
                      <th className="px-4 py-3 font-bold">序列号 (SN)</th>
                      <th className="px-4 py-3 font-bold">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_DEVICES.map(device => (
                      <tr 
                        key={device.id} 
                        className={`hover:bg-blue-50 transition-colors cursor-pointer ${selectedIds.includes(device.id) ? 'bg-blue-50/50' : ''}`}
                        onClick={() => toggleSelection(device.id)}
                      >
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(device.id)} 
                            onChange={() => {}}
                            className="rounded text-blue-500 border-gray-300 focus:ring-blue-500" 
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{device.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-400">{device.sn}</td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center space-x-1 ${device.status === 'online' ? 'text-green-500' : 'text-gray-400'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{device.status === 'online' ? '在线' : '离线'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-8 py-2 bg-[#409eff] text-white rounded hover:bg-blue-600 transition text-sm font-medium"
            >
              确定
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionModals;
