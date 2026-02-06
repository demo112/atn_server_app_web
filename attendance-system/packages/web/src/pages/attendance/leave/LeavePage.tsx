import React, { useEffect, useState, useCallback } from 'react';
import { LeaveVo, LeaveType, LeaveStatus } from '@attendance/shared';
import * as leaveService from '@/services/leave';
import { LeaveDialog } from './components/LeaveDialog';
import Pagination from './components/Pagination';
import dayjs from 'dayjs';
import { logger } from '@/utils/logger';
import { useToast } from '@/components/common/ToastProvider';
import StandardModal from '@/components/common/StandardModal';
import { PersonnelSelectionModal, SelectionItem } from '@/components/common/PersonnelSelectionModal';

const LeavePage: React.FC = () => {
  const { toast } = useToast();
  const [data, setData] = useState<LeaveVo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null); // Replaced by modal
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectionItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveVo | undefined>(undefined);
  
  // Confirm Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    employeeId: undefined as number | undefined,
    type: undefined as LeaveType | undefined,
    startTime: '',
    endTime: ''
  });

  const fetchData = useCallback(async () => {
    if (filters.startTime && filters.endTime && filters.startTime > filters.endTime) {
      toast.warning('开始时间不能晚于结束时间');
      return;
    }

    try {
      setLoading(true);
      const queryParams: any = {
        page,
        pageSize,
        type: filters.type,
        startTime: filters.startTime || undefined,
        endTime: filters.endTime || undefined,
      };

      if (selectedItems.length > 0) {
        const item = selectedItems[0];
        if (item.type === 'department') {
          queryParams.deptId = item.id;
        } else {
          queryParams.employeeId = item.id;
        }
      }

      const res = await leaveService.getLeaves(queryParams);
      setData(res.items || []);
      setTotal(res.total);
    } catch (error) {
      logger.error('Failed to fetch leaves', error);
      toast.error('加载请假列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, selectedItems, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = (): void => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: LeaveVo): void => {
    if (item.status === LeaveStatus.cancelled) {
      toast.warning('已撤销记录不可编辑');
      return;
    }
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleCancelClick = (id: number): void => {
    setItemToCancel(id);
    setConfirmModalOpen(true);
  };

  const handleConfirmCancel = async (): Promise<void> => {
    if (!itemToCancel) return;
    setConfirmLoading(true);
    try {
      await leaveService.cancelLeave(itemToCancel);
      toast.success('撤销成功');
      fetchData();
      setConfirmModalOpen(false);
    } catch (err) {
      logger.error('Leave cancellation failed', err);
      toast.error('撤销失败');
    } finally {
      setConfirmLoading(false);
      setItemToCancel(null);
    }
  };

  const getTypeLabel = (type: LeaveType) => {
    const labels: Record<string, string> = {
      [LeaveType.annual]: '年假',
      [LeaveType.sick]: '病假',
      [LeaveType.personal]: '事假',
      [LeaveType.business_trip]: '出差',
      [LeaveType.other]: '其他'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: LeaveType) => {
    const colors: Record<string, string> = {
      [LeaveType.annual]: 'bg-blue-100 text-blue-800',
      [LeaveType.sick]: 'bg-orange-100 text-orange-800',
      [LeaveType.personal]: 'bg-cyan-100 text-cyan-800',
      [LeaveType.business_trip]: 'bg-green-100 text-green-800',
      [LeaveType.other]: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: LeaveStatus) => {
    const colors: Record<string, string> = {
      [LeaveStatus.pending]: 'bg-yellow-100 text-yellow-800',
      [LeaveStatus.approved]: 'bg-green-100 text-green-800',
      [LeaveStatus.rejected]: 'bg-red-100 text-red-800',
      [LeaveStatus.cancelled]: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 flex flex-col p-6 min-h-0">
        <div className="flex flex-col flex-1 bg-white rounded-lg shadow-sm p-6 min-h-0">
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">请假/出差管理</h1>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors"
              >
                <span className="material-icons text-xl">add</span>
                <span>申请请假</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div 
                onClick={() => setIsSelectionModalOpen(true)}
                className="relative cursor-pointer w-48"
              >
                <input
                  type="text"
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] cursor-pointer"
                  placeholder="选择部门或人员"
                  value={selectedItems.map(i => i.name).join(', ')}
                />
                <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
              </div>
              <select
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                value={filters.type || ''}
                onChange={e => setFilters({...filters, type: e.target.value ? e.target.value as LeaveType : undefined})}
              >
                <option value="">所有类型</option>
                <option value={LeaveType.annual}>年假</option>
                <option value={LeaveType.sick}>病假</option>
                <option value={LeaveType.personal}>事假</option>
                <option value={LeaveType.business_trip}>出差</option>
                <option value={LeaveType.other}>其他</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                  value={filters.startTime}
                  max={filters.endTime}
                  onChange={e => setFilters({...filters, startTime: e.target.value})}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="datetime-local"
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                  value={filters.endTime}
                  min={filters.startTime}
                  onChange={e => setFilters({...filters, endTime: e.target.value})}
                />
              </div>
              <button
                onClick={() => setPage(1)}
                className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors"
              >
                查询
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto min-h-0 border rounded-lg">
            <table className="w-full text-left border-collapse min-w-[1000px] relative">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 text-gray-600 shadow-sm">
                <th className="p-4 font-medium">员工ID</th>
                <th className="p-4 font-medium">类型</th>
                <th className="p-4 font-medium">开始时间</th>
                <th className="p-4 font-medium">结束时间</th>
                <th className="p-4 font-medium">时长(小时)</th>
                <th className="p-4 font-medium">状态</th>
                <th className="p-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                data.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4">{item.employeeId}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td className="p-4">{dayjs(item.startTime).format('YYYY-MM-DD HH:mm')}</td>
                    <td className="p-4">{dayjs(item.endTime).format('YYYY-MM-DD HH:mm')}</td>
                    <td className="p-4">{dayjs(item.endTime).diff(dayjs(item.startTime), 'hour', true).toFixed(1)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="text-[#4A90E2] hover:text-[#357ABD]"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleCancelClick(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          撤销
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-shrink-0 flex justify-end mt-4">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p, ps) => {
              setPage(p);
              if (ps) setPageSize(ps);
            }}
          />
        </div>

        <LeaveDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchData();
          }}
          initialData={selectedItem}
        />

        <StandardModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="确认撤销"
          footer={
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={confirmLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {confirmLoading ? '处理中...' : '确定'}
              </button>
            </div>
          }
        >
          <p className="text-gray-600">确定要撤销这条记录吗？</p>
        </StandardModal>
      </div>
      </div>
      <PersonnelSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onConfirm={(items) => {
          setSelectedItems(items);
          setIsSelectionModalOpen(false);
          setPage(1);
        }}
        multiple={false}
        selectType="all"
        title="选择部门或人员"
        initialSelected={selectedItems}
      />
    </div>
  );
};

export default LeavePage;
