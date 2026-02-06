import React from 'react';
import { ModalTab } from '../types_ui';

interface SidebarProps {
  activeTab: ModalTab;
  setActiveTab: (tab: ModalTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: ModalTab.BASIC_INFO, label: '基本信息' },
    { id: ModalTab.FACE_PHOTO, label: '人脸照片' },
    // Removed '车辆信息' (Vehicle Info) as requested by user
    { id: ModalTab.CARD_NUMBER, label: '卡号' },
  ];

  return (
    <div className="w-40 bg-gray-50 border-r border-gray-200 py-4 transition-colors">
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium border-r-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-[#409eff] text-[#409eff] bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-[#409eff] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
