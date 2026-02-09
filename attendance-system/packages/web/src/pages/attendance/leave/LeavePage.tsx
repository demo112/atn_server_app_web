import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/common/ToastProvider';
import { 
  getLeaves, 
  createLeave, 
  updateLeave, 
  deleteLeave
} from '../../../services/leave';
import { LeaveVo, CreateLeaveDto, LeaveStatus, LeaveType } from '@attendance/shared';
import PersonnelSelectionModal, { SelectionItem } from '../../../components/common/PersonnelSelectionModal';
import dayjs from 'dayjs';

// 状态标签颜色映射
const statusColors: Record<LeaveStatus, string> = {
  [LeaveStatus.pending]: 'bg-yellow-100 text-yellow-800',
  [LeaveStatus.approved]: 'bg-green-100 text-green-800',
  [LeaveStatus.rejected]: 'bg-red-100 text-red-800',
  [LeaveStatus.cancelled]: 'bg-gray-100 text-gray-800',
};

// 状态显示文本映射
const statusLabels: Record<LeaveStatus, string> = {
  [LeaveStatus.pending]: '待审批',
  [LeaveStatus.approved]: '已通过',
  [LeaveStatus.rejected]: '已拒绝',
  [LeaveStatus.cancelled]: '已撤销',
};

// 请假类型显示文本映射
const leaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.annual]: '年假',
  [LeaveType.sick]: '病假',
  [LeaveType.personal]: '事假',
  [LeaveType.business_trip]: '出差',
  [LeaveType.maternity]: '产假',
  [LeaveType.paternity]: '陪产假',
  [LeaveType.marriage]: '婚假',
  [LeaveType.bereavement]: '丧假',
  [LeaveType.other]: '其他',
};

const LeavePage: React.FC = () => {
  // const { user } = useAuth(); // Unused
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<LeaveVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateLeaveDto>({
    employeeId: 0,
    type: LeaveType.personal,
    startTime: '',
    endTime: '',
    reason: '',
  });
  
  // 筛选状态
  const [selectedItems, setSelectedItems] = useState<SelectionItem[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 分页状态
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const employeeIds = selectedItems
        .filter(i => i.type === 'employee')
        .map(i => parseInt(String(i.id)));
        
      const res = await getLeaves({
        page,
        pageSize,
        employeeId: employeeIds.length > 0 ? employeeIds[0] : undefined, // 目前API只支持单个
        startTime: startDate ? `${startDate}T00:00:00` : undefined,
        endTime: endDate ? `${endDate}T23:59:59` : undefined
      });
      if (res && res.items) {
        setLeaves(res.items);
        setTotal(res.total);
      }
    } catch (error) {
      showToast('获取列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [page, selectedItems, startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateLeave(editingId, formData);
        showToast('更新成功', 'success');
      } else {
        await createLeave(formData);
        showToast('创建成功', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchLeaves();
    } catch (error) {
      showToast(editingId ? '更新失败' : '创建失败', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除吗？')) return;
    try {
      await deleteLeave(id);
      showToast('删除成功', 'success');
      fetchLeaves();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: 0,
      type: LeaveType.personal,
      startTime: '',
      endTime: '',
      reason: '',
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (leave: LeaveVo) => {
    setEditingId(leave.id);
    setFormData({
      employeeId: leave.employeeId,
      type: leave.type,
      startTime: new Date(leave.startTime).toISOString().slice(0, 16),
      endTime: new Date(leave.endTime).toISOString().slice(0, 16),
      reason: leave.reason || '',
    });
    setIsModalOpen(true);
  };

  const handleSelectionConfirm = (items: SelectionItem[]) => {
    setSelectedItems(items);
    // 如果是创建模式，自动填充第一个选中的员工ID
    if (isModalOpen && items.length > 0 && items[0].type === 'employee') {
      setFormData(prev => ({ ...prev, employeeId: parseInt(String(items[0].id)) }));
    }
    setIsSelectionModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">请假/出差管理</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <span className="material-icons text-sm">add</span>
          新增记录
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">员工筛选</label>
            <div 
              onClick={() => !isModalOpen && setIsSelectionModalOpen(true)}
              className="relative cursor-pointer"
            >
              <input
                type="text"
                readOnly
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                placeholder="选择员工..."
                value={selectedItems.map(i => i.name).join(', ')}
              />
              <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setSelectedItems([]);
              setStartDate('');
              setEndDate('');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      {/* 列表表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b">
                <th className="p-4 font-medium">员工</th>
                <th className="p-4 font-medium">类型</th>
                <th className="p-4 font-medium">开始时间</th>
                <th className="p-4 font-medium">结束时间</th>
                <th className="p-4 font-medium">时长(天)</th>
                <th className="p-4 font-medium">原因</th>
                <th className="p-4 font-medium">状态</th>
                <th className="p-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {leave.employeeName || `ID: ${leave.employeeId}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leave.deptName}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        leave.type === LeaveType.business_trip ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {leaveTypeLabels[leave.type] || leave.type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {dayjs(leave.startTime).format('YYYY-MM-DD HH:mm')}
                    </td>
                    <td className="p-4 text-gray-600">
                      {dayjs(leave.endTime).format('YYYY-MM-DD HH:mm')}
                    </td>
                    <td className="p-4 text-gray-600">
                      {((new Date(leave.endTime).getTime() - new Date(leave.startTime).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1)}
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={leave.reason || ''}>
                      {leave.reason}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[leave.status]}`}>
                        {statusLabels[leave.status] || leave.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">

                      <button
                        onClick={() => openEditModal(leave)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(leave.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页 */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            共 <span className="font-medium">{total}</span> 条记录
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
            >
              上一页
            </button>
            <span className="px-3 py-1 text-sm text-gray-600 self-center">
              第 {page} 页
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={leaves.length < pageSize}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* 创建/编辑弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? '编辑记录' : '新增记录'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  员工 ID (手动输入或使用筛选器选择)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: parseInt(e.target.value)})}
                  />
                  <button
                    type="button"
                    onClick={() => setIsSelectionModalOpen(true)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    选择
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as LeaveType})}
                >
                  {Object.values(LeaveType).map(type => (
                    <option key={type} value={type}>{leaveTypeLabels[type]}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">原因</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 人员选择弹窗 */}
      <PersonnelSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onConfirm={handleSelectionConfirm}
        multiple={false}
        title="选择员工"
      />
    </div>
  );
};

export default LeavePage;
