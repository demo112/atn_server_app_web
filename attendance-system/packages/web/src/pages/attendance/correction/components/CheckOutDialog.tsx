import React, { useEffect, useState } from 'react';
import * as correctionService from '@/services/correction';
import dayjs from 'dayjs';
import { logger } from '@/utils/logger';
import StandardModal from '@/components/common/StandardModal';
import { useToast } from '@/components/common/ToastProvider';

interface CheckOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dailyRecordId: string;
  employeeName?: string;
  workDate?: string;
}

export const CheckOutDialog: React.FC<CheckOutDialogProps> = ({ 
  isOpen, onClose, onSuccess, dailyRecordId, employeeName, workDate 
}): React.ReactElement => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [remark, setRemark] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setCheckOutTime(dayjs().format('YYYY-MM-DDTHH:mm'));
      setRemark('');
    }
  }, [isOpen]);

  const handleSubmit = async (): Promise<void> => {
    try {
      if (!checkOutTime) {
        error('请选择签退时间');
        return;
      }
      setLoading(true);

      await correctionService.supplementCheckOut({
        dailyRecordId,
        checkOutTime: new Date(checkOutTime).toISOString(),
        remark
      });
      
      success('补签退成功');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      logger.error('CheckOut failed', err);
      error('补签失败');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
      >
        取消
      </button>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '提交中...' : '确定'}
      </button>
    </>
  );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="补签退"
      footer={footer}
      width="max-w-md"
    >
      <div className="space-y-6">
        {employeeName && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start text-sm text-blue-700">
             <span className="material-icons text-blue-500 mr-2 text-base mt-0.5">info</span>
             <div className="flex flex-col">
               <span>员工: <span className="font-medium">{employeeName}</span></span>
               <span>日期: <span className="font-medium">{workDate}</span></span>
             </div>
          </div>
        )}

        <div className="space-y-4">
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">签退时间 <span className="text-red-500">*</span></label>
                <input
                    type="datetime-local"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm transition-shadow"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">备注</label>
                <textarea
                    rows={3}
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="请输入补签原因..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary sm:text-sm resize-none transition-shadow"
                />
            </div>
        </div>
      </div>
    </StandardModal>
  );
};
