import React, { useState } from 'react';
import { AttendanceGroup } from '../types';
import SelectionModals from './SelectionModals';
import { SelectionItem } from '@/components/common/PersonnelSelectionModal';

interface GroupFormProps {
  group: AttendanceGroup | null;
  onCancel: () => void;
  onSave: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({ group, onCancel, onSave }) => {
  const [modalType, setModalType] = useState<'personnel' | 'shift' | 'device' | null>(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState<SelectionItem[]>([]);

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-1 h-4 bg-[#409eff] rounded-full" />
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
      {/* Breadcrumb / Header */}
      <div className="flex items-center mb-6 text-sm text-gray-500">
        <button 
          onClick={onCancel}
          className="flex items-center hover:text-blue-500 transition"
        >
          <span className="material-icons text-sm mr-1">chevron_left</span>
          <span>{group ? '编辑考勤组' : '新增考勤组'}</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Basic Config */}
          <section className="mb-10">
            <SectionTitle title="基本配置" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4"><span className="text-red-500">*</span> 考勤组名称</label>
                <input 
                  className="flex-1 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm" 
                  placeholder="请输入" 
                  defaultValue={group?.name || ''}
                  type="text" 
                />
              </div>
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4"><span className="text-red-500">*</span> 考勤组人员</label>
                <div 
                  onClick={() => setModalType('personnel')}
                  className="flex-1 relative cursor-pointer"
                >
                  <input 
                    className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer bg-white" 
                    placeholder="请选择" 
                    readOnly 
                    type="text" 
                    value={selectedPersonnel.length > 0 ? `${selectedPersonnel.length} 人` : (group ? `${group.memberCount} 人` : '')}
                  />
                  <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">more_horiz</span>
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4">有效期</label>
                <select className="flex-1 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option>永久</option>
                  <option>自定义</option>
                </select>
              </div>
            </div>
          </section>

          {/* Punch Config */}
          <section className="mb-10">
            <SectionTitle title="打卡配置" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4">打卡方式</label>
                <select className="flex-1 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option>仅通过设备打卡</option>
                  <option>手机App打卡</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4"><span className="text-red-500">*</span> 打卡设备</label>
                <div 
                  onClick={() => setModalType('device')}
                  className="flex-1 relative cursor-pointer"
                >
                  <input 
                    className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer bg-white" 
                    placeholder="请选择" 
                    readOnly 
                    type="text" 
                  />
                  <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">more_horiz</span>
                </div>
              </div>
            </div>
          </section>

          {/* Attendance Config */}
          <section>
            <SectionTitle title="考勤配置" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4 flex items-center justify-end">
                  考勤类型 <span className="material-icons text-[12px] text-gray-400 ml-1">help_outline</span>
                </label>
                <select className="flex-1 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option>固定班制</option>
                  <option>排班制</option>
                  <option>自由工时</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4 flex items-center justify-end">
                  节假日休息 <span className="material-icons text-[12px] text-gray-400 ml-1">help_outline</span>
                </label>
                <div className="flex-1 flex items-center">
                  <button className="w-10 h-5 bg-blue-500 rounded-full relative transition-colors shadow-inner">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                  </button>
                  <span className="ml-2 text-xs text-gray-400">开启</span>
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-32 text-sm text-gray-600 text-right pr-4 flex items-center justify-end">
                  考勤自动计算 <span className="material-icons text-[12px] text-gray-400 ml-1">help_outline</span>
                </label>
                <div className="flex-1 relative">
                  <input 
                    className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm" 
                    type="text" 
                    defaultValue="05:00" 
                  />
                  <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">schedule</span>
                </div>
              </div>
            </div>

            {/* Attendance Days Table */}
            <div className="mt-8">
              <h3 className="text-sm font-medium mb-4 text-gray-700">考勤时间</h3>
              <div className="border border-gray-200 rounded-md overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[1000px]">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-6 py-3 font-semibold border-b border-gray-200">星期</th>
                      <th className="px-6 py-3 font-semibold border-b border-gray-200">班次</th>
                      <th className="px-6 py-3 font-semibold border-b border-gray-200 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {['星期一', '星期二', '星期三', '星期四', '星期五'].map((day) => (
                      <tr key={day} className="hover:bg-gray-50 group">
                        <td className="px-6 py-3">{day}</td>
                        <td className="px-6 py-3 text-gray-400 italic">未选择班次</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition">
                            <button 
                              onClick={() => setModalType('shift')}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <span className="material-icons text-lg">edit</span>
                            </button>
                            <button className="text-gray-400 hover:text-red-500">
                              <span className="material-icons text-lg">delete_outline</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {['星期六', '星期日'].map((day) => (
                      <tr key={day} className="hover:bg-gray-50 group">
                        <td className="px-6 py-3">{day}</td>
                        <td className="px-6 py-3 text-gray-400 italic">休假</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition">
                            <button 
                              onClick={() => setModalType('shift')}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <span className="material-icons text-lg">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="mt-10 flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button 
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button 
              onClick={onSave}
              className="px-6 py-2 bg-[#409eff] text-white rounded hover:bg-blue-600 transition shadow-sm"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
      
      {modalType && (
        <SelectionModals 
          type={modalType} 
          onClose={() => setModalType(null)}
          onConfirm={(data) => {
            if (modalType === 'personnel') {
              setSelectedPersonnel(data);
            }
          }}
          initialSelected={modalType === 'personnel' ? selectedPersonnel : undefined}
        />
      )}
    </div>
  );
};

export default GroupForm;
