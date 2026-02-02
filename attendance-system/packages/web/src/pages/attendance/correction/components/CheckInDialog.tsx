import React, { useState, useEffect } from 'react';
import { attendanceCorrectionService } from '@/services/attendance-correction';

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dailyRecordId: string;
  employeeName?: string;
  workDate?: string;
}

export const CheckInDialog: React.FC<CheckInDialogProps> = ({ 
  isOpen, onClose, onSuccess, dailyRecordId, employeeName, workDate 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkInTime: '',
    remark: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Default to current time or sensible default?
      // Maybe current time in ISO format for datetime-local: YYYY-MM-DDTHH:mm
      const now = new Date();
      const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setFormData({
        checkInTime: localIso,
        remark: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Convert local time to UTC or send as ISO string (backend expects ISO string)
      // new Date(formData.checkInTime).toISOString()
      const date = new Date(formData.checkInTime);
      
      await attendanceCorrectionService.checkIn({
        dailyRecordId,
        checkInTime: date.toISOString(),
        remark: formData.remark
      });
      
      alert('补签到成功');
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
        <h3 style={{ marginTop: 0 }}>补签到</h3>
        {employeeName && <p style={{ color: '#666', fontSize: '0.9em' }}>员工: {employeeName} | 日期: {workDate}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>签到时间:</label>
            <input 
              type="datetime-local" 
              value={formData.checkInTime} 
              onChange={e => setFormData({...formData, checkInTime: e.target.value})} 
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
