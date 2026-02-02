import React, { useState, useEffect } from 'react';
import { TimePeriod } from '@attendance/shared';
import { createTimePeriod, updateTimePeriod } from '@/services/time-period';

interface TimePeriodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: TimePeriod;
}

export const TimePeriodDialog: React.FC<TimePeriodDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialData 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 0, // 0:固定, 1:弹性
    startTime: '',
    endTime: '',
    restStartTime: '',
    restEndTime: '',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        restStartTime: initialData.restStartTime || '',
        restEndTime: initialData.restEndTime || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        type: 0,
        startTime: '',
        endTime: '',
        restStartTime: '',
        restEndTime: '',
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('请输入名称');
      return;
    }
    if (formData.type === 0) {
      if (!formData.startTime || !formData.endTime) {
        alert('固定班制必须设置上班和下班时间');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        restStartTime: formData.restStartTime || undefined,
        restEndTime: formData.restEndTime || undefined,
      };

      if (initialData) {
        await updateTimePeriod(initialData.id, payload);
      } else {
        await createTimePeriod(payload);
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
        <h3 style={{ marginTop: 0 }}>{initialData ? '编辑时间段' : '新建时间段'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>名称 <span style={{color: 'red'}}>*</span></label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>类型 <span style={{color: 'red'}}>*</span></label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: Number(e.target.value)})}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value={0}>固定班制</option>
              <option value={1}>弹性班制</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label>上班时间 {formData.type === 0 && <span style={{color: 'red'}}>*</span>}</label>
              <input 
                type="time" 
                value={formData.startTime} 
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                required={formData.type === 0}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label>下班时间 {formData.type === 0 && <span style={{color: 'red'}}>*</span>}</label>
              <input 
                type="time" 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                required={formData.type === 0}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label>午休开始</label>
              <input 
                type="time" 
                value={formData.restStartTime} 
                onChange={e => setFormData({...formData, restStartTime: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label>午休结束</label>
              <input 
                type="time" 
                value={formData.restEndTime} 
                onChange={e => setFormData({...formData, restEndTime: e.target.value})}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
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
