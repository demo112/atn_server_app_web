import React, { useEffect, useState } from 'react';
import { TimePeriod } from '@attendance/shared';
import { getTimePeriods, deleteTimePeriod } from '@/services/time-period';
import { TimePeriodDialog } from './components/TimePeriodDialog';

const TimePeriodPage: React.FC = () => {
  const [periods, setPeriods] = useState<TimePeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | undefined>(undefined);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const data = await getTimePeriods();
      setPeriods(data);
    } catch (error) {
      console.error('Failed to fetch time periods:', error);
      alert('加载时间段列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个时间段吗？如果已被班次引用将无法删除。')) {
      return;
    }

    try {
      await deleteTimePeriod(id);
      alert('删除成功');
      fetchPeriods();
    } catch (error: any) {
      console.error('Failed to delete:', error);
      alert('删除失败: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (period: TimePeriod) => {
    setSelectedPeriod(period);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPeriod(undefined);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchPeriods();
  };

  const formatTime = (start?: string, end?: string) => {
    if (!start && !end) return '-';
    return `${start || ''} - ${end || ''}`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        <h2 style={{ margin: 0 }}>时间段设置</h2>
        <button 
          onClick={handleCreate}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#1890ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + 新建时间段
        </button>
      </header>

      {loading ? (
        <div>加载中...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>ID</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>名称</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>类型</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>工作时间</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>休息时间</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{period.id}</td>
                <td style={{ padding: '12px' }}>{period.name}</td>
                <td style={{ padding: '12px' }}>
                  {period.type === 0 ? '固定班制' : '弹性班制'}
                </td>
                <td style={{ padding: '12px' }}>
                  {formatTime(period.startTime, period.endTime)}
                </td>
                <td style={{ padding: '12px' }}>
                  {formatTime(period.restStartTime, period.restEndTime)}
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => handleEdit(period)}
                    style={{ marginRight: '8px', cursor: 'pointer', border: 'none', background: 'none', color: '#1890ff' }}
                  >
                    编辑
                  </button>
                  <button 
                    onClick={() => handleDelete(period.id)}
                    style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ff4d4f' }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* 弹窗组件将在 Task 9 实现，这里先占位或暂时注释，以免报错 */}
      {isDialogOpen && (
        <TimePeriodDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={handleSuccess}
          initialData={selectedPeriod}
        />
      )}
    </div>
  );
};

export default TimePeriodPage;
