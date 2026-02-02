import React, { useEffect, useState } from 'react';
import { LeaveVo, LeaveType, LeaveStatus } from '@attendance/shared';
import { leaveService } from '@/services/attendance/leave';
import { LeaveDialog } from './components/LeaveDialog';

const LeavePage: React.FC = () => {
  const [data, setData] = useState<LeaveVo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveVo | undefined>(undefined);
  
  // Filters
  const [employeeId, setEmployeeId] = useState('');
  const [type, setType] = useState<LeaveType | ''>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await leaveService.getLeaves({
        page,
        pageSize: 10,
        employeeId: employeeId ? Number(employeeId) : undefined,
        type: type || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
      });
      setData(res.data || []);
      setTotal(res.pagination.total);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      alert('加载请假列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]); // Reload when page changes

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleCreate = () => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: LeaveVo) => {
    if (item.status === LeaveStatus.cancelled) {
      alert('已撤销记录不可编辑');
      return;
    }
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('确定要撤销这条记录吗？')) return;
    try {
      await leaveService.cancelLeave(id);
      alert('撤销成功');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert('撤销失败');
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    fetchData();
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString();
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>请假/出差管理</h2>
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
            + 录入记录
          </button>
        </div>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            placeholder="员工ID" 
            value={employeeId} 
            onChange={e => setEmployeeId(e.target.value)}
            style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' }}
          />
          <select 
            value={type} 
            onChange={e => setType(e.target.value as any)}
            style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">所有类型</option>
            {Object.values(LeaveType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input 
            type="date"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <span>-</span>
          <input 
            type="date"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button 
            onClick={handleSearch}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#f0f0f0', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            查询
          </button>
        </div>
      </header>

      {loading ? (
        <div>加载中...</div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>ID</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>员工</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>部门</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>类型</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>时间范围</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>事由</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>状态</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{item.id}</td>
                  <td style={{ padding: '12px' }}>{item.employeeName} ({item.employeeId})</td>
                  <td style={{ padding: '12px' }}>{item.deptName || '-'}</td>
                  <td style={{ padding: '12px' }}>{item.type}</td>
                  <td style={{ padding: '12px' }}>
                    {formatDate(item.startTime)} <br/> 
                    {formatDate(item.endTime)}
                  </td>
                  <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.reason}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      backgroundColor: item.status === LeaveStatus.approved ? '#e6f7ff' : 
                                     item.status === LeaveStatus.cancelled ? '#f5f5f5' : '#fffbe6',
                      color: item.status === LeaveStatus.approved ? '#1890ff' : 
                             item.status === LeaveStatus.cancelled ? '#999' : '#faad14'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {item.status !== LeaveStatus.cancelled && (
                      <>
                        <button 
                          onClick={() => handleEdit(item)}
                          style={{ marginRight: '8px', cursor: 'pointer', border: 'none', background: 'none', color: '#1890ff' }}
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleCancel(item.id)}
                          style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ff4d4f' }}
                        >
                          撤销
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
             <button 
               disabled={page === 1}
               onClick={() => setPage(p => p - 1)}
               style={{ padding: '6px 12px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
             >
               上一页
             </button>
             <span style={{ display: 'flex', alignItems: 'center' }}>
               第 {page} 页 / 共 {Math.ceil(total / 10) || 1} 页
             </span>
             <button 
               disabled={page * 10 >= total}
               onClick={() => setPage(p => p + 1)}
               style={{ padding: '6px 12px', cursor: page * 10 >= total ? 'not-allowed' : 'pointer' }}
             >
               下一页
             </button>
          </div>
        </>
      )}

      {isDialogOpen && (
        <LeaveDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={handleSuccess}
          initialData={selectedItem}
        />
      )}
    </div>
  );
};

export default LeavePage;
