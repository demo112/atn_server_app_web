
import React, { useState } from 'react';
import { TabKey, MenuKey, SubMenuKey, AttendanceRecord } from './types';
import Header from './components/Header';
import MainSidebar from './components/MainSidebar';
import OrgSidebar from './components/OrgSidebar';
import CorrectionView from './components/CorrectionView';
import CorrectionModal from './components/CorrectionModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('attendance');
  const [activeMenu, setActiveMenu] = useState<MenuKey>('process');
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuKey>('correction');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Module Sidebar */}
        <MainSidebar 
          activeMenu={activeMenu}
          activeSubMenu={activeSubMenu}
          onMenuChange={setActiveMenu}
          onSubMenuChange={setActiveSubMenu}
        />

        {/* Organizational Selection Sidebar */}
        <OrgSidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* View Title/Breadcrumb */}
          <div className="bg-white border-b border-slate-100 px-8 py-5">
            <h1 className="text-xl font-bold text-slate-900">补签记录</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>
              查看、检索和管理所有员工的历史手工补签记录。
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeSubMenu === 'correction' ? (
              <CorrectionView onEdit={handleEdit} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                {activeSubMenu} 模块正在开发中...
              </div>
            )}
          </div>
        </main>
      </div>

      <CorrectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        record={editingRecord}
      />
      
      {/* Decorative Activation Reminder (per original design) */}
      <div className="fixed bottom-4 right-4 text-[10px] text-slate-400 select-none pointer-events-none text-right">
        激活 Windows<br/>
        转到“设置”以激活 Windows。
      </div>
    </div>
  );
};

export default App;
