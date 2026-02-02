import React, { useState, useEffect } from 'react';
import { LeaveType, LeaveVo } from '@attendance/shared';
import { leaveService } from '@/services/attendance/leave';

interface LeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: LeaveVo;
}

export const LeaveDialog: React.FC<LeaveDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialData 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: LeaveType.annual,
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        employeeId: initialData.employeeId.toString(),
        type: initialData.type,
        startTime: initialData.startTime.slice(0, 16), // datetime-local format YYYY-MM-DDTHH:mm
        endTime: initialData.endTime.slice(0, 16),
        reason: initialData.reason || ''
      });
    } else if (isOpen) {
      setFormData({
        employeeId: '',
        type: LeaveType.annual,
        startTime: '',
        endTime: '',
        reason: ''
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.startTime || !formData.endTime) {
      alert('请填写完整信息');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('开始时间必须早于结束时间');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        employeeId: Number(formData.employeeId),
        type: formData.type,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        reason: formData.reason
      };

      if (initialData) {
        // 更新时 employeeId 通常不可变，但这里后端 DTO 不包含 employeeId 更新，所以无所谓
        await leaveService.updateLeave(initialData.id, {
          type: payload.type,
          startTime: payload.startTime,
          endTime: payload.endTime,
          reason: payload.reason,
          operatorId: 0 // 后端会注入当前用户
        });
      } else {
        await leaveService.createLeave({
          ...payload,
          operatorId: 0 // 后端注入
        });
      }
      
      alert(initialData ? '更新成功' : '创建成功');
      onSuccess();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.message || '操作失败';
      alert(`操作失败: ${msg}`);
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
        <h3 style={{ marginTop: 0 }}>{initialData ? '编辑请假记录' : '录入请假记录'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>员工ID <span style={{color: 'red'}}>*</span></label>
            <input 
              type="number" 
              value={formData.employeeId} 
              onChange={e => setFormData({...formData, employeeId: e.target.value})}
              required
              disabled={!!initialData} // 编辑时禁止修改人
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: initialData ? '#eee' : 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>请假类型 <span style={{color: 'red'}}>*</span></label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value as LeaveType})}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              {Object.values(LeaveType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label>开始时间 <span style={{color: 'red'}}>*</span></label>
              <input 
                type="datetime-local" 
                value={formData.startTime} 
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                required
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label>结束时间 <span style={{color: 'red'}}>*</span></label>
              <input 
                type="datetime-local" 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                required
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>事由</label>
            <textarea 
              value={formData.reason} 
              onChange={e => setFormData({...formData, reason: e.target.value})}
              rows={3}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: 'white', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                cursor: 'pointer' 
              }}
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#1890ff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '提交中...' : '确定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
