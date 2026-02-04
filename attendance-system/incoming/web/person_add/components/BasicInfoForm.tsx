
import React from 'react';
import { FormData } from '../types';

interface BasicInfoFormProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, onChange }) => {
  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      {/* Department */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="text-red-500 mr-1">*</span>所属部门:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md text-sm px-3 py-2 cursor-not-allowed transition-colors" 
            disabled 
            type="text" 
            value={data.department}
          />
        </div>
      </div>

      {/* Cloud Account */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
          <span className="text-xs text-orange-500">*开通后，可使用[我的房屋]功能</span>
        </div>
      </div>

      {/* SMS invite checkbox */}
      <div className="grid grid-cols-4 items-center">
        <div className="col-span-1"></div>
        <div className="col-span-3">
          <label className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input 
              className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary h-4 w-4 mr-2" 
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
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="text-red-500 mr-1">*</span>姓名:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            placeholder="请输入姓名" 
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          手机号码:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            placeholder="请输入手机号码" 
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
      </div>

      {/* Employee ID */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          工号:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            placeholder="请输入工号" 
            type="text"
            value={data.employeeId}
            onChange={(e) => onChange('employeeId', e.target.value)}
          />
        </div>
      </div>

      {/* Gender */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          性别:
        </label>
        <div className="col-span-3 flex space-x-6">
          {['male', 'female', 'unknown'].map((g) => (
            <label key={g} className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input 
                className="text-primary focus:ring-primary mr-2 border-gray-300 dark:border-gray-600" 
                name="gender" 
                type="radio" 
                value={g}
                checked={data.gender === g}
                onChange={() => onChange('gender', g)}
              />
              {g === 'male' ? '男' : g === 'female' ? '女' : '未知'}
            </label>
          ))}
        </div>
      </div>

      {/* Password */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          开门密码:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            placeholder="请输入开门密码" 
            type="password"
            value={data.doorPassword}
            onChange={(e) => onChange('doorPassword', e.target.value)}
          />
        </div>
      </div>

      {/* Validity */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="text-red-500 mr-1">*</span>人员有效期:
        </label>
        <div className="col-span-3">
          <select 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat transition-colors"
            value={data.validity}
            onChange={(e) => onChange('validity', e.target.value)}
          >
            <option>永久有效</option>
            <option>自定义时长</option>
          </select>
        </div>
      </div>

      {/* ID Type */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          证件类型:
        </label>
        <div className="col-span-3">
          <select 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat transition-colors"
            value={data.idType}
            onChange={(e) => onChange('idType', e.target.value)}
          >
            <option>身份证</option>
            <option>护照</option>
            <option>驾照</option>
          </select>
        </div>
      </div>

      {/* ID Number */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          证件号码:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            placeholder="请输入证件号码" 
            type="text"
            value={data.idNumber}
            onChange={(e) => onChange('idNumber', e.target.value)}
          />
        </div>
      </div>

      {/* Birth Date */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          出生年月:
        </label>
        <div className="col-span-3 relative">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary pr-10 transition-colors" 
            placeholder="请选择日期" 
            type="text"
            value={data.birthDate}
            onChange={(e) => onChange('birthDate', e.target.value)}
          />
          <span className="material-icons absolute right-3 top-2 text-gray-400 text-lg pointer-events-none">calendar_month</span>
        </div>
      </div>
    </form>
  );
};

export default BasicInfoForm;
