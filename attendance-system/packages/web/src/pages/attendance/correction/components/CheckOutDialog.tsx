import React, { useState, useEffect } from 'react';
import { attendanceCorrectionService } from '@/services/attendance-correction';

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
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkOutTime: '',
    remark: ''
  });

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setFormData({
        checkOutTime: localIso,
        remark: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const date = new Date(formData.checkOutTime);
      
      await attendanceCorrectionService.checkOut({
        dailyRecordId,
        checkOutTime: date.toISOString(),
        remark: formData.remark
      });
      
      alert('补签退成功');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error?.message || '补签失败';
      alert(`补签失败: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center' 
    }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px', width: '400px' }}>
        <h3 style={{ marginTop: 0 }}>补签退</h3>
        {employeeName && <p style={{ color: '#666', fontSize: '0.9em' }}>员工: {employeeName} | 日期: {workDate}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>签退时间:</label>
            <input 
              type="datetime-local" 
              value={formData.checkOutTime} 
              onChange={e => setFormData({...formData, checkOutTime: e.target.value})} 
              required 
              style={{ padding: '8px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>备注:</label>
            <textarea 
              value={formData.remark} 
              onChange={e => setFormData({...formData, remark: e.target.value})} 
              rows={3}
              style={{ padding: '8px' }}
              placeholder="请输入补签原因..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: 'white', border: '1px solid #d9d9d9', borderRadius: '4px' }}
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              {loading ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
