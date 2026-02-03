import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendance';
import { Shift } from '@attendance/shared';
import { message } from 'antd';
import { logger } from '@/utils/logger';

interface BatchScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  deptId?: number;
}

export const BatchScheduleDialog: React.FC<BatchScheduleDialogProps> = ({ isOpen, onClose, onSuccess, deptId }): React.ReactElement | null => {
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [formData, setFormData] = useState({
    shiftId: '',
    startDate: '',
    endDate: '',
    force: false,
    includeSubDepartments: false
  });

  const loadData = async (): Promise<void> => {
      try {
          const res = await attendanceService.getShifts();
          setShifts(res);
      } catch (e) {
          logger.error('Failed to load shifts', e);
      }
  };

  useEffect(() => {
    if (isOpen) {
        loadData();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!deptId) {
        message.error('请先选择部门');
        return;
    }
    setLoading(true);
    try {
      const res = await attendanceService.batchCreateSchedule({
        departmentIds: [deptId],
        shiftId: Number(formData.shiftId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        force: formData.force,
        includeSubDepartments: formData.includeSubDepartments
      });
      message.success(`批量排班成功，影响 ${res.count} 条记录`);
      onSuccess();
      onClose();
    } catch (err) {
      logger.error('Batch schedule failed', err);
      message.error('批量创建失败');
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
        <h3 style={{ marginTop: 0 }}>批量排班 (部门ID: {deptId})</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>选择班次:</label>
            <select 
                value={formData.shiftId} 
                onChange={e => setFormData({...formData, shiftId: e.target.value})} 
                required 
                style={{ padding: '8px' }}
            >
                <option value="">-- 请选择 --</option>
                {shifts.map(shift => (
                    <option key={shift.id} value={shift.id}>
                        {shift.name}
                    </option>
                ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label>开始日期:</label>
                <input 
                    type="date" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    required 
                    style={{ padding: '8px' }}
                />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label>结束日期:</label>
                <input 
                    type="date" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    required 
                    style={{ padding: '8px' }}
                />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input 
                        type="checkbox" 
                        id="batchForce" 
                        checked={formData.force} 
                        onChange={e => setFormData({...formData, force: e.target.checked})} 
                    />
                    <label htmlFor="batchForce" style={{ cursor: 'pointer' }}>
                        强制覆盖 (忽略冲突)
                    </label>
                </div>
                {formData.force && (
                    <div style={{ fontSize: '12px', color: '#faad14', marginLeft: '20px' }}>
                        注意：存在跨天重叠时，新排班将优先，自动覆盖旧排班的重叠部分。
                    </div>
                )}
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                    type="checkbox" 
                    id="includeSub" 
                    checked={formData.includeSubDepartments} 
                    onChange={e => setFormData({...formData, includeSubDepartments: e.target.checked})} 
                />
                <label htmlFor="includeSub" style={{ cursor: 'pointer' }}>
                    包含子部门
                </label>
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>取消</button>
            <button 
                type="submit" 
                disabled={loading}
                style={{ 
                    padding: '8px 16px', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                {loading ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
