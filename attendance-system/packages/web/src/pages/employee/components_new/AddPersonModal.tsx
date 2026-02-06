import React, { useState } from 'react';
import { ModalTab, FormData } from '../types_ui';
import Sidebar from './Sidebar';
import BasicInfoForm from './BasicInfoForm';
import { employeeService } from '../../../services/employee';

interface AddPersonModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>(ModalTab.BASIC_INFO);
  const [formData, setFormData] = useState<FormData>({
    department: '',
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
    hireDate: new Date().toISOString().split('T')[0], // Default today
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name) { alert('请输入姓名'); return; }
    if (!formData.deptId) { alert('请选择部门'); return; }
    if (!formData.employeeId) { alert('请输入工号'); return; }

    try {
      await employeeService.createEmployee({
        name: formData.name,
        employeeNo: formData.employeeId,
        deptId: formData.deptId,
        hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
        phone: formData.phone || undefined,
        // Note: other fields like gender, idType, idNumber are not supported by backend yet
      });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create employee:', error);
      alert('保存失败，请重试');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case ModalTab.BASIC_INFO:
        return <BasicInfoForm data={formData} onChange={handleInputChange} />;
      case ModalTab.FACE_PHOTO:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
            <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:border-[#409eff] transition-colors cursor-pointer group">
              <span className="material-icons text-5xl text-gray-300 group-hover:text-[#409eff] transition-colors">add_a_photo</span>
              <p className="mt-4 text-sm text-gray-400">点击上传人脸照片</p>
            </div>
            <p className="text-xs text-gray-500 max-w-xs text-center">建议分辨率 480*640 以上，图片大小不超过 5MB，确保面部无遮挡。</p>
          </div>
        );
      case ModalTab.CARD_NUMBER:
        return (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 items-center">
              <label className="col-span-1 text-sm font-medium text-gray-700">卡号:</label>
              <div className="col-span-3">
                <input 
                  type="text" 
                  className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff]"
                  placeholder="请输入或读取卡号"
                />
              </div>
            </div>
            <div className="flex justify-center mt-12">
               <button className="flex items-center space-x-2 text-[#409eff] hover:underline text-sm font-medium">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-[840px] max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-6 py-3 bg-[#409eff] flex justify-between items-center shrink-0">
          <h3 className="text-lg font-semibold text-white">添加人员</h3>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors focus:outline-none flex items-center justify-center"
          >
            <span className="material-icons text-xl">close</span>
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
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end items-center space-x-3 bg-white transition-colors">
        <button 
          onClick={() => { handleSave(); }}
          className="px-4 py-2 border border-[#409eff] text-[#409eff] hover:bg-blue-50 rounded transition-all text-sm font-medium active:scale-95"
        >
          保存并继续
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-[#409eff] text-white hover:bg-blue-600 rounded shadow-sm transition-all text-sm font-medium active:scale-95"
        >
          确定
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded transition-all text-sm font-medium active:scale-95"
        >
          取消
        </button>
      </div>
      </div>
    </div>
  );
};

export default AddPersonModal;
