import React, { useEffect, useState, useCallback } from 'react';
import { getShifts, deleteShift, createShift, updateShift } from '../../../services/shift';
import { createTimePeriod, updateTimePeriod } from '../../../services/time-period';
import type { 
  Shift as BackendShift, 
  CreateShiftDto, 
  UpdateShiftDto,
  CreateTimePeriodDto,
  UpdateTimePeriodDto,
  TimePeriod
} from '@attendance/shared';
import ShiftModal from './components/ShiftModal';
import ShiftTable from './components/ShiftTable';
import Pagination from './components/Pagination';
import { Shift as UIShift, ShiftTimeConfig } from './types';
import StandardModal from '../../../components/common/StandardModal';
import { useToast } from '../../../components/common/ToastProvider';

const ShiftPage: React.FC = (): React.ReactElement => {
  // const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<UIShift[]>([]);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<UIShift | null>(null);

  // Confirm Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  const { toast } = useToast();

  const mapBackendToUI = useCallback((backendShift: BackendShift): UIShift => {
    let periodsToUse: TimePeriod[] = [];

    if (backendShift.days && backendShift.days.length > 0) {
      // Use the first day's periods (assuming single day or representative day for list)
      const sortedDays = [...backendShift.days].sort((a, b) => a.dayOfCycle - b.dayOfCycle);
      periodsToUse = sortedDays[0].periods;
    } else if (backendShift.periods && backendShift.periods.length > 0) {
      // Legacy structure
      periodsToUse = [...backendShift.periods]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(p => p.period)
        .filter((p): p is TimePeriod => !!p);
    }
    
    // Map periods to times
    const times: ShiftTimeConfig[] = periodsToUse.map(tp => {
      return {
        id: tp.id,
        clockIn: tp.startTime || '09:00',
        clockOut: tp.endTime || '18:00',
        isClockInMandatory: true,
        isClockOutMandatory: true,
        validFromStart: tp.rules?.checkInStartOffset ? calculateTime(tp.startTime, -tp.rules.checkInStartOffset) : '08:00',
        validFromEnd: tp.rules?.checkInEndOffset ? calculateTime(tp.startTime, tp.rules.checkInEndOffset) : '10:00',
        validUntilStart: tp.rules?.checkOutStartOffset ? calculateTime(tp.endTime, -tp.rules.checkOutStartOffset) : '17:00',
        validUntilEnd: tp.rules?.checkOutEndOffset ? calculateTime(tp.endTime, tp.rules.checkOutEndOffset) : '19:00',
      };
    });

    // Determine grace periods from the first period (assuming uniform for now)
    const firstPeriod = periodsToUse[0];
    const lateGrace = firstPeriod?.rules?.lateGraceMinutes || 0;
    const earlyLeaveGrace = firstPeriod?.rules?.earlyLeaveGraceMinutes || 0;

    return {
      id: backendShift.id.toString(),
      name: backendShift.name,
      dailyCheckins: Math.min(Math.max(times.length, 1), 3) as 1 | 2 | 3,
      times: times.length > 0 ? times : [],
      lateGracePeriod: lateGrace,
      earlyLeaveGracePeriod: earlyLeaveGrace,
      markAbsentIfNoCheckIn: 'Absent', // Backend doesn't seem to have this field yet, defaulting
      markAbsentIfNoCheckOut: 'Absent',
    };
  }, []);

  const fetchShifts = useCallback(async (name?: string, currentPage: number = 1, size: number = 10): Promise<void> => {
    // setLoading(true);
    try {
      const { items, total } = await getShifts({ name, page: currentPage, pageSize: size });
      const uiShifts = items.map(mapBackendToUI);
      setShifts(uiShifts);
      setTotal(total);
    } catch (err) {
      console.error(err);
      toast.error('获取班次列表失败');
    } finally {
      // setLoading(false);
    }
  }, [mapBackendToUI, toast]);

  useEffect(() => {
    fetchShifts(searchText, page, pageSize);
  }, [fetchShifts, searchText, page, pageSize]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleDeleteClick = (id: string): void => {
    setShiftToDelete(id);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!shiftToDelete) return;
    setConfirmLoading(true);
    try {
      await deleteShift(parseInt(shiftToDelete));
      toast.success('删除成功');
      fetchShifts(searchText, page, pageSize);
      setConfirmModalOpen(false);
    } catch {
      toast.error('删除失败');
    } finally {
      setConfirmLoading(false);
      setShiftToDelete(null);
    }
  };

  const handleEdit = (shift: UIShift) => {
    setCurrentShift(shift);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setCurrentShift(null);
    setIsModalOpen(true);
  };

  const handleModalConfirm = async (uiData: UIShift) => {
    try {
      // setLoading(true);
      // 1. Process TimePeriods
      const periodIds: number[] = [];

      for (const time of uiData.times) {
        const rules = {
          lateGraceMinutes: uiData.lateGracePeriod,
          earlyLeaveGraceMinutes: uiData.earlyLeaveGracePeriod,
          // Calculate offsets based on valid windows
          checkInStartOffset: calculateDiff(time.clockIn, time.validFromStart),
          checkInEndOffset: calculateDiff(time.validFromEnd, time.clockIn),
          checkOutStartOffset: calculateDiff(time.clockOut, time.validUntilStart),
          checkOutEndOffset: calculateDiff(time.validUntilEnd, time.clockOut),
        };

        const periodData: CreateTimePeriodDto = {
          name: `${uiData.name} Period`,
          type: 0, // Fixed
          startTime: time.clockIn,
          endTime: time.clockOut,
          rules,
        };

        let periodId: number;
        if (time.id) {
          // Update existing
          const updateData: UpdateTimePeriodDto = periodData;
          await updateTimePeriod(time.id, updateData);
          periodId = time.id;
        } else {
          // Create new
          const newPeriod = await createTimePeriod(periodData);
          periodId = newPeriod.id;
        }
        periodIds.push(periodId);
      }

      // 2. Create/Update Shift
      const shiftPeriods = periodIds.map((pid, index) => ({
        periodId: pid,
        dayOfCycle: 1, // Daily shift
        sortOrder: index + 1
      }));

      if (currentShift && currentShift.id) {
        const updateDto: UpdateShiftDto = {
          name: uiData.name,
          cycleDays: 1,
          periods: shiftPeriods
        };
        await updateShift(parseInt(currentShift.id), updateDto);
        toast.success('更新成功');
      } else {
        const createDto: CreateShiftDto = {
          name: uiData.name,
          cycleDays: 1,
          periods: shiftPeriods
        };
        await createShift(createDto);
        toast.success('创建成功');
      }
      
      setIsModalOpen(false);
      fetchShifts(searchText, page, pageSize);
    } catch (error) {
      console.error(error);
      toast.error('操作失败');
    } finally {
      // setLoading(false);
    }
  };

  const confirmFooter = (
    <div className="flex justify-end space-x-2">
      <button
        onClick={() => setConfirmModalOpen(false)}
        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        取消
      </button>
      <button
        onClick={handleConfirmDelete}
        disabled={confirmLoading}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {confirmLoading ? '删除中...' : '删除'}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#141414] p-6">
      <div className="bg-white dark:bg-[#1f1f1f] rounded-sm shadow-sm flex flex-col min-h-full">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleAdd}
              className="flex items-center px-4 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm hover:border-blue-500 hover:text-blue-500 transition-colors bg-white dark:bg-transparent text-slate-600 dark:text-slate-300"
            >
              <span className="material-icons text-lg mr-1">add</span>
              新增
            </button>
            <button 
              onClick={() => fetchShifts(searchText, page, pageSize)}
              className="flex items-center px-4 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm hover:border-blue-500 hover:text-blue-500 transition-colors bg-white dark:bg-transparent text-slate-600 dark:text-slate-300"
            >
              <span className="material-icons text-lg mr-1">refresh</span>
              刷新
            </button>
          </div>
          
          <div className="relative w-64">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="搜索班次名称" 
              value={searchText}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 relative overflow-auto p-4">
          <ShiftTable 
            shifts={shifts} 
            onDelete={handleDeleteClick} 
            onEdit={handleEdit} 
          />
        </div>

        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
        />
      </div>

      <ShiftModal 
        isOpen={isModalOpen} 
        initialData={currentShift}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />

      {/* Delete Confirmation Modal */}
      <StandardModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="确认删除"
        footer={confirmFooter}
        width="400px"
      >
        <div className="flex items-start">
          <span className="material-icons text-yellow-500 text-3xl mr-3">warning</span>
          <div>
            <p className="text-sm text-gray-500 mt-1">
              确定要删除这个班次吗？此操作无法撤销。
            </p>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

// Helper functions for time calculation
function calculateTime(base: string = '00:00', diffMinutes: number): string {
  const [h, m] = base.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + diffMinutes, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function calculateDiff(t1: string, t2: string): number {
  const [h1, m1] = t1.split(':').map(Number);
  const [h2, m2] = t2.split(':').map(Number);
  return (h1 * 60 + m1) - (h2 * 60 + m2);
}

export default ShiftPage;
