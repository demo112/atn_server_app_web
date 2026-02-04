
import React, { useState } from 'react';
import { ModalTab, FormData } from '../types';
import Sidebar from './Sidebar';
import BasicInfoForm from './BasicInfoForm';

interface AddPersonModalProps {
  onClose: () => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>(ModalTab.BASIC_INFO);
  const [formData, setFormData] = useState<FormData>({
    department: 'atnd01_dev的宇视云',
    enableCloudAccount: false,
    sendInviteSms: false,
    name: '',
    phone: '',
    employeeId: '',
    gender: 'unknown',
    doorPassword: '',
    validity: '永久有效',
    idType: '身份证',
    idNumber: '',
    birthDate: '',
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving personnel data:', formData);
    onClose();
  };

  const renderContent = () => {
    switch (activeTab) {
      case ModalTab.BASIC_INFO:
        return <BasicInfoForm data={formData} onChange={handleInputChange} />;
      case ModalTab.FACE_PHOTO:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
            <div className="w-48 h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 hover:border-primary transition-colors cursor-pointer group">
              <span className="material-icons text-5xl text-gray-300 group-hover:text-primary transition-colors">add_a_photo</span>
              <p className="mt-4 text-sm text-gray-400">点击上传人脸照片</p>
            </div>
            <p className="text-xs text-gray-500 max-w-xs text-center">建议分辨率 480*640 以上，图片大小不超过 5MB，确保面部无遮挡。</p>
          </div>
        );
      case ModalTab.CARD_NUMBER:
        return (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 items-center">
              <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">卡号:</label>
              <div className="col-span-3">
                <input 
                  type="text" 
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="请输入或读取卡号"
                />
              </div>
            </div>
            <div className="flex justify-center mt-12">
               <button className="flex items-center space-x-2 text-primary hover:underline text-sm font-medium">
                 <span className="material-icons text-base">sensors</span>
                 <span>读取物理卡</span>
               </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 w-[840px] max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 sticky top-0 z-10 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">添加人员</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <span className="material-icons">close</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Form Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar transition-colors">
          {renderContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center space-x-3 bg-white dark:bg-gray-800 transition-colors">
        <button 
          onClick={() => { console.log('Save and Continue'); }}
          className="px-4 py-2 border border-primary text-primary hover:bg-blue-50 dark:hover:bg-primary/10 rounded transition-all text-sm font-medium active:scale-95"
        >
          保存并继续
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-primary text-white hover:bg-blue-600 rounded shadow-sm transition-all text-sm font-medium active:scale-95"
        >
          确定
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all text-sm font-medium active:scale-95"
        >
          取消
        </button>
      </div>
    </div>
  );
};

export default AddPersonModal;
