import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendance';
import { employeeService } from '@/services/employee';
import { Employee, Shift } from '@attendance/shared';

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    startDate: '',
    endDate: '',
    force: false
  });

  useEffect(() => {
    if (isOpen) {
        loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
        // 并行加载员工和班次
        const [empRes, shiftRes] = await Promise.all([
            employeeService.getEmployees({ pageSize: 100 }), // 简单起见取前100
            attendanceService.getShifts()
        ]);
        
        if (empRes.data) {
            // PaginatedResponse
            setEmployees(empRes.data || []);
        }
        if (shiftRes.data) {
             // ApiResponse<Shift[]> or any[]
             // attendanceService.getShifts returns ApiResponse<any[]> in my definition, need to cast or fix definition
             setShifts(shiftRes.data as Shift[]);
        }
    } catch (e) {
        console.error('Failed to load data', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await attendanceService.createSchedule({
        employeeId: Number(formData.employeeId),
        shiftId: Number(formData.shiftId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        force: formData.force
      });
      alert('排班创建成功');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error?.message || '创建失败';
      alert(`创建失败: ${msg}`);
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
        <h3 style={{ marginTop: 0 }}>新建排班</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label>选择员工:</label>
            <select 
                value={formData.employeeId} 
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
                required
                style={{ padding: '8px' }}
            >
                <option value="">-- 请选择 --</option>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employeeNo})
                    </option>
                ))}
            </select>
          </div>

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                    type="checkbox" 
                    id="force"
                    checked={formData.force}
                    onChange={e => setFormData({...formData, force: e.target.checked})}
                />
                <label htmlFor="force" style={{ cursor: 'pointer' }}>
                    强制覆盖 (忽略冲突)
                </label>
            </div>
            {formData.force && (
                <div style={{ fontSize: '12px', color: '#faad14', marginLeft: '20px' }}>
                    注意：存在跨天重叠时，新排班将优先，自动覆盖旧排班的重叠部分。
                </div>
            )}
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
