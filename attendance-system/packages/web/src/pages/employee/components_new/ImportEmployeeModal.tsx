import React, { useState, useRef } from 'react';
import StandardModal from '../../../components/common/StandardModal';
import { employeeService } from '../../../services/employee';
import { toast } from '../../../providers/ToastProvider';

interface ImportEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportEmployeeModal: React.FC<ImportEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await employeeService.getImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('下载模板失败');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning('请选择文件');
      return;
    }

    setUploading(true);
    try {
      await employeeService.importEmployees(file);
      toast.success('导入成功');
      onSuccess();
      onClose();
      setFile(null);
    } catch (error) {
      // Error is handled by request interceptor toast usually, but if specific handling needed:
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="导入人员"
      footer={
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">取消</button>
          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? '上传中...' : '开始导入'}
          </button>
        </div>
      }
    >
      <div className="space-y-6 p-2">
        {/* Step 1: Template */}
        <div className="border-b pb-4">
          <h4 className="font-medium text-gray-900 mb-2">第一步：下载模板</h4>
          <p className="text-sm text-gray-500 mb-3">请下载标准模板，并按照格式要求填写人员信息。</p>
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <span className="material-icons text-base">download</span>
            <span>下载导入模板.xlsx</span>
          </button>
        </div>

        {/* Step 2: Upload */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">第二步：上传文件</h4>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".xlsx"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <span className="material-icons">description</span>
                <span className="font-medium">{file.name}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1 hover:bg-green-100 rounded-full"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="material-icons text-gray-400 text-3xl">cloud_upload</span>
                <p className="text-sm text-gray-500">点击上传 Excel 文件 (.xlsx)</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <h5 className="text-xs font-bold text-blue-800 mb-1">注意事项</h5>
          <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
            <li>工号必须唯一，重复将导致导入失败</li>
            <li>部门名称必须与系统中存在的部门完全一致</li>
            <li>一次建议导入不超过 1000 条数据</li>
          </ul>
        </div>
      </div>
    </StandardModal>
  );
};

export default ImportEmployeeModal;
