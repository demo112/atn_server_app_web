import React, { useEffect, useState } from 'react';
import { FormData } from '../types_ui';
import { departmentService } from '../../../services/department';
import { DepartmentVO } from '@attendance/shared';

interface BasicInfoFormProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, onChange }) => {
  const [departments, setDepartments] = useState<DepartmentVO[]>([]);

  useEffect(() => {
    departmentService.getTree().then(setDepartments).catch(console.error);
  }, []);

  const flattenDepartments = (depts: DepartmentVO[], level = 0): {id: number, name: string, level: number}[] => {
    return depts.reduce((acc, dept) => {
      acc.push({ id: dept.id, name: dept.name, level });
      if (dept.children) {
        acc.push(...flattenDepartments(dept.children, level + 1));
      }
      return acc;
    }, [] as {id: number, name: string, level: number}[]);
  };

  const flatDepts = flattenDepartments(departments);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      {/* Department */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="text-red-500 mr-1">*</span>所属部门:
        </label>
        <div className="col-span-3">
          <select
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            value={data.deptId || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              const dept = flatDepts.find(d => d.id === id);
              onChange('deptId', id);
              onChange('department', dept?.name || '');
            }}
          >
            <option value="">请选择部门</option>
            {flatDepts.map(dept => (
              <option key={dept.id} value={dept.id}>
                {'\u00A0'.repeat(dept.level * 4)}{dept.name}
              </option>
            ))}
          </select>
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

      {/* Hire Date (New) */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="text-red-500 mr-1">*</span>入职日期:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            type="date"
            value={data.hireDate || ''}
            onChange={(e) => onChange('hireDate', e.target.value)}
          />
        </div>
      </div>

      {/* Gender */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          性别:
        </label>
        <div className="col-span-3 flex space-x-6">
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="gender" 
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
              checked={data.gender === 'male'}
              onChange={() => onChange('gender', 'male')}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">男</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input 
              type="radio" 
              name="gender" 
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
              checked={data.gender === 'female'}
              onChange={() => onChange('gender', 'female')}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">女</span>
          </label>
        </div>
      </div>

      {/* Door Password */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          开门密码:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            placeholder="请输入密码" 
            type="password"
            value={data.doorPassword}
            onChange={(e) => onChange('doorPassword', e.target.value)}
          />
        </div>
      </div>

      {/* Validity */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          有效期:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
            value="永久有效"
            readOnly
          />
        </div>
      </div>

      {/* ID Type */}
      <div className="grid grid-cols-4 items-center">
        <label className="col-span-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          证件类型:
        </label>
        <div className="col-span-3">
          <select 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
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
          出生日期:
        </label>
        <div className="col-span-3">
          <input 
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary transition-colors" 
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
