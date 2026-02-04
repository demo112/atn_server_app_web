
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OrgTree } from './components/OrgTree';
import { LeaveModal } from './components/LeaveModal';
import { LeaveRequest, LeaveType } from './types';
import { INITIAL_LEAVE_REQUESTS } from './constants';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Partial<LeaveRequest> | null>(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleOpenModal = (request?: LeaveRequest) => {
    setEditingRequest(request || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleModalSubmit = (data: Partial<LeaveRequest>) => {
    if (editingRequest?.id) {
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? { ...r, ...data } as LeaveRequest : r));
    } else {
      const newRequest: LeaveRequest = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
      } as LeaveRequest;
      setRequests(prev => [newRequest, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex overflow-hidden">
          <OrgTree />
          
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900/50 p-6 overflow-hidden">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <button 
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  <span className="material-icons-round text-xl">add</span>
                  <span>请假/出差</span>
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors" title="刷新">
                    <span className="material-icons-round">refresh</span>
                  </button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors" title="筛选">
                    <span className="material-icons-round">filter_list</span>
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700/50 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">工号</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">姓名</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">部门</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">开始时间</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">结束时间</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">请假/出差</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">申请时间</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">备注</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {requests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{req.employeeId}</td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-white">{req.employeeName}</td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{req.department}</td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{req.startTime}</td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{req.endTime}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            req.type === LeaveType.LEAVE 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                          }`}>
                            {req.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{req.applyTime}</td>
                        <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{req.note}</td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleOpenModal(req)}
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" 
                              title="编辑"
                            >
                              <span className="material-icons-round text-lg">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(req.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                              title="删除"
                            >
                              <span className="material-icons-round text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span>共 {requests.length} 条</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" disabled>
                      <span className="material-icons-round">chevron_left</span>
                    </button>
                    <button className="w-8 h-8 rounded bg-primary text-white font-medium">1</button>
                    <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" disabled>
                      <span className="material-icons-round">chevron_right</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md text-sm py-1 focus:ring-primary focus:border-primary">
                    <option>20条/页</option>
                    <option>50条/页</option>
                    <option>100条/页</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <span>跳至</span>
                    <input className="w-12 h-8 text-center border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary" type="text" defaultValue="1" />
                    <span>页</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <LeaveModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingRequest || undefined}
      />
    </div>
  );
};

export default App;
