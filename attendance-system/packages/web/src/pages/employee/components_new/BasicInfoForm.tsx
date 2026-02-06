import React, { useState } from 'react';
import { FormData } from '../types_ui';
import PersonnelSelectionModal from '@/components/common/PersonnelSelectionModal';

interface BasicInfoFormProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  isDeptLocked?: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, onChange, isDeptLocked = false }) => {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      {/* Department */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          <span className="text-red-500 mr-1">*</span>所属部门:
        </label>
        <div className="col-span-3">
          <div 
            onClick={() => !isDeptLocked && setIsDeptModalOpen(true)}
            className={`relative ${isDeptLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="text"
              readOnly
              placeholder="请选择部门"
              value={data.department || ''}
              disabled={isDeptLocked}
              className={`w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors ${
                isDeptLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            {!isDeptLocked && (
              <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">arrow_drop_down</span>
            )}
          </div>
        </div>
      </div>

      <PersonnelSelectionModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onConfirm={(items) => {
          if (items.length > 0) {
            onChange('deptId', Number(items[0].id));
            onChange('department', items[0].name);
          }
          setIsDeptModalOpen(false);
        }}
        multiple={false}
        selectType="department"
        title="选择部门"
        initialSelected={data.deptId ? [{
          id: String(data.deptId),
          name: data.department || '',
          type: 'department'
        }] : []}
      />

      {/* Cloud Account */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          <span className="text-red-500 mr-1">*</span>开通云账号:
        </label>
        <div className="col-span-3 flex items-center space-x-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              className="sr-only peer" 
              type="checkbox" 
              checked={data.enableCloudAccount} 
              onChange={(e) => onChange('enableCloudAccount', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#409eff]"></div>
          </label>
          <span className="text-xs text-orange-500">*开通后，可使用[我的房屋]功能</span>
        </div>
      </div>

      {/* SMS invite checkbox */}
      <div className="grid grid-cols-4 items-center">
        <div className="col-span-1"></div>
        <div className="col-span-3">
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input 
              className="rounded border-gray-300 text-[#409eff] focus:ring-[#409eff] h-4 w-4 mr-2" 
              type="checkbox"
              checked={data.sendInviteSms}
              onChange={(e) => onChange('sendInviteSms', e.target.checked)}
            />
            向TA发送短信邀请通知
          </label>
        </div>
      </div>

      {/* Name */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          <span className="text-red-500 mr-1">*</span>姓名:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            placeholder="请输入姓名" 
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          手机号码:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            placeholder="请输入手机号码" 
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
      </div>

      {/* Employee ID */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          工号:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            placeholder="请输入工号" 
            type="text"
            value={data.employeeId}
            onChange={(e) => onChange('employeeId', e.target.value)}
          />
        </div>
      </div>

      {/* Hire Date (New) */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          <span className="text-red-500 mr-1">*</span>入职日期:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            type="date"
            value={data.hireDate || ''}
            onChange={(e) => onChange('hireDate', e.target.value)}
          />
        </div>
      </div>

      {/* Gender */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          性别:
        </label>
        <div className="col-span-3 flex space-x-6">
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="gender" 
              className="w-4 h-4 text-[#409eff] focus:ring-[#409eff] border-gray-300"
              checked={data.gender === 'male'}
              onChange={() => onChange('gender', 'male')}
            />
            <span className="ml-2 text-sm text-gray-700">男</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="gender" 
              className="w-4 h-4 text-[#409eff] focus:ring-[#409eff] border-gray-300"
              checked={data.gender === 'female'}
              onChange={() => onChange('gender', 'female')}
            />
            <span className="ml-2 text-sm text-gray-700">女</span>
          </label>
        </div>
      </div>

      {/* Door Password */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          开门密码:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            placeholder="请输入密码" 
            type="password"
            value={data.doorPassword}
            onChange={(e) => onChange('doorPassword', e.target.value)}
          />
        </div>
      </div>

      {/* Validity */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          有效期:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            value="永久有效"
            readOnly
          />
        </div>
      </div>

      {/* ID Type */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          证件类型:
        </label>
        <div className="col-span-3">
          <select 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors"
            value={data.idType}
            onChange={(e) => onChange('idType', e.target.value)}
          >
            <option>身份证</option>
            <option>护照</option>
            <option>驾驶证</option>
          </select>
        </div>
      </div>

      {/* ID Number */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          证件号码:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            placeholder="请输入证件号码" 
            type="text"
            value={data.idNumber}
            onChange={(e) => onChange('idNumber', e.target.value)}
          />
        </div>
      </div>

      {/* Birth Date */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700">
          出生日期:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-[#409eff] focus:border-[#409eff] transition-colors" 
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange('birthDate', e.target.value)}
          />
        </div>
      </div>
    </form>
  );
};

export default BasicInfoForm;
