
import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import CorrectionModal from './components/CorrectionModal';
import { MOCK_ATTENDANCE_DATA } from './constants';
import { AttendanceRecord, ModalType } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_DATA);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const openModal = (type: ModalType, record: AttendanceRecord) => {
    setSelectedRecord(record);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRecord(null);
  };

  const handleConfirm = (formData: { time: string }) => {
    // In a real application, you would send this to an API
    console.log('Submitting Correction:', {
      recordId: selectedRecord?.id,
      type: modalType,
      ...formData
    });
    
    alert(`补签成功！\n时间：${formData.time.replace('T', ' ')}`);
    closeModal();
  };

  const filteredData = data.filter(item => 
    item.name.includes(searchTerm) || 
    item.employeeId.includes(searchTerm) ||
    item.department.includes(searchTerm)
  );

  return (
    <Layout>
      {/* Filters Header */}
      <div className="bg-white px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-3">
            <span className="text-slate-500">起止时间</span>
            <div className="flex items-center border border-slate-300 rounded px-2.5 py-1.5 bg-white cursor-pointer hover:border-primary transition-colors">
              <span>2026-01-06</span>
              <span className="mx-2 text-slate-400">-</span>
              <span>2026-02-04</span>
              <span className="material-icons text-sm ml-2 text-slate-400">calendar_today</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-primary">
            <button className="hover:underline">昨天</button>
            <button className="hover:underline">最近7天</button>
            <button className="font-bold border-b-2 border-primary pb-0.5">最近30天</button>
            <button className="hover:underline">当月</button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative group">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-primary">search</span>
            <input 
              type="text" 
              placeholder="请输入关键字并回车" 
              className="pl-9 pr-4 py-1.5 border-slate-300 rounded text-sm w-56 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded text-sm font-medium flex items-center transition-all shadow-sm">
            <span className="material-icons text-sm mr-1">add</span>
            新增补签
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium whitespace-nowrap">
              <tr>
                <th className="px-4 py-3 font-medium">工作日</th>
                <th className="px-4 py-3 font-medium">部门</th>
                <th className="px-4 py-3 font-medium">工号</th>
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium text-center">班次名称</th>
                <th className="px-4 py-3 font-medium text-center">上下班时间段</th>
                <th className="px-4 py-3 font-medium text-center">签到时间</th>
                <th className="px-4 py-3 font-medium text-center">签退时间</th>
                <th className="px-4 py-3 font-medium text-center">考勤状态</th>
                <th className="px-4 py-3 font-medium text-center">缺勤时长(分)</th>
                <th className="px-4 py-3 font-medium text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.workday}</td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.department}</td>
                  <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{row.employeeId}</td>
                  <td className="px-4 py-3.5 text-slate-900 font-medium whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-center whitespace-nowrap">{row.shiftName}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-center whitespace-nowrap">{row.shiftTime}</td>
                  <td className="px-4 py-3.5 text-slate-400 text-center italic">{row.clockIn || '(~)'}</td>
                  <td className="px-4 py-3.5 text-slate-400 text-center italic">{row.clockOut || '(~)'}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      row.status === '缺勤' ? 'text-red-500 bg-red-50' : 
                      row.status === '正常' ? 'text-green-500 bg-green-50' : 
                      'text-orange-500 bg-orange-50'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 text-center">{row.absenceDuration}</td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center space-x-2 text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1 hover:bg-primary/10 rounded-md transition-all" 
                        title="补签到"
                        onClick={() => openModal('in', row)}
                      >
                        <span className="material-icons text-xl">event_available</span>
                      </button>
                      <button 
                        className="p-1 hover:bg-primary/10 rounded-md transition-all" 
                        title="补签退"
                        onClick={() => openModal('out', row)}
                      >
                        <span className="material-icons text-xl">logout</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <span className="material-icons text-4xl block mb-2">inventory_2</span>
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-end space-x-4 text-sm text-slate-600 shrink-0">
        <span>共 {filteredData.length} 条</span>
        <div className="flex items-center space-x-1">
          <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-slate-50 disabled:opacity-30" disabled>
            <span className="material-icons text-base">chevron_left</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-primary bg-blue-50 text-primary font-semibold rounded">1</button>
          <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-slate-50">
            <span className="material-icons text-base">chevron_right</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select className="border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer">
            <option>20条/页</option>
            <option>50条/页</option>
            <option>100条/页</option>
          </select>
          <span className="text-slate-500">跳至</span>
          <input 
            type="text" 
            className="w-10 border border-slate-200 rounded py-1 text-center outline-none focus:ring-1 focus:ring-primary" 
            defaultValue="1" 
          />
          <span className="text-slate-500">页</span>
        </div>
      </footer>

      <CorrectionModal 
        type={modalType} 
        record={selectedRecord} 
        onClose={closeModal} 
        onConfirm={handleConfirm}
      />
    </Layout>
  );
};

export default App;
