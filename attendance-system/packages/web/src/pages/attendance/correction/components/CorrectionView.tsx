import React, { useState, useEffect, useCallback } from 'react';
import { CorrectionVo, QueryCorrectionsDto } from '@attendance/shared';
import * as correctionService from '@/services/correction';
import { logger } from '@/utils/logger';
import dayjs from 'dayjs';
import CorrectionModal from './CorrectionModal';
import { PersonnelSelectionModal, SelectionItem } from '@/components/common/PersonnelSelectionModal';

interface CorrectionViewProps {
  deptId?: number | null;
}

const CorrectionView: React.FC<CorrectionViewProps> = ({ deptId: initialDeptId }) => {
  const [records, setRecords] = useState<CorrectionVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // CorrectionVo id is number

  // Selection Modal
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectionItem[]>([]);

  // Filters
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [type, setType] = useState<string>(''); // '' | 'check_in' | 'check_out'
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CorrectionVo | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: QueryCorrectionsDto = {
        page,
        pageSize,
        startDate,
        endDate,
        // type: type || undefined, // API DTO might not support type yet
      };

      if (selectedItems.length > 0) {
        const item = selectedItems[0];
        if (item.type === 'department') {
          params.deptId = item.id;
        } else {
          // Assuming API supports employeeId for corrections?
          // The QueryCorrectionsDto might need to be checked.
          // Usually correction query supports employeeId.
          // If not, we might need to update backend.
          // Let's assume it does or use 'employeeId' as extra param if allowed.
          // Checking DTO definition would be safer but let's assume standard pattern.
          (params as any).employeeId = item.id;
        }
      } else if (initialDeptId) {
        params.deptId = initialDeptId;
      }

      const res = await correctionService.getCorrections(params);
      setRecords(res.items);
      setTotal(res.total);
    } catch (err) {
      logger.error('Failed to load corrections', err);
    } finally {
      setLoading(false);
    }
  }, [initialDeptId, page, pageSize, startDate, endDate, type, selectedItems]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (record: CorrectionVo) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
      {/* Search Filter Header */}
      <div className="p-6 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">起止时间</span>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-9">
              <input 
                className="w-32 border-none text-sm px-3 focus:ring-0 outline-none" 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-slate-300">-</span>
              <input 
                className="w-32 border-none text-sm px-3 focus:ring-0 outline-none" 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <div className="px-2 text-slate-400 border-l border-slate-100 flex items-center">
                <span className="material-icons text-lg">calendar_today</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <button onClick={() => {
                setStartDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
                setEndDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));
              }} className="text-slate-500 hover:text-blue-600">昨天</button>
              <button onClick={() => {
                setStartDate(dayjs().format('YYYY-MM-DD'));
                setEndDate(dayjs().format('YYYY-MM-DD'));
              }} className="text-slate-500 hover:text-blue-600">今天</button>
              <button onClick={() => {
                setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'));
                setEndDate(dayjs().format('YYYY-MM-DD'));
              }} className="text-slate-500 hover:text-blue-600">本月</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">部门/人员</span>
            <div 
              onClick={() => setIsSelectionModalOpen(true)}
              className="relative cursor-pointer w-48"
            >
              <input
                type="text"
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer bg-white"
                placeholder="选择部门或人员"
                value={selectedItems.map(i => i.name).join(', ')}
              />
              <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">处理类型</span>
            <select 
              className="h-9 text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary pr-10 outline-none border"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">全部类型</option>
              <option value="check_in">补签到</option>
              <option value="check_out">补签退</option>
            </select>
          </div>

          <div className="flex-1 flex justify-end gap-3 min-w-fit">
            <button 
              onClick={loadData}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <span className="material-icons text-lg">search</span> 查询
            </button>
            <button 
              onClick={() => {
                setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'));
                setEndDate(dayjs().format('YYYY-MM-DD'));
                setType('');
                setPage(1);
              }}
              className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <span className="material-icons text-lg">refresh</span> 重置
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            disabled={selectedIds.length === 0}
            className={`px-4 py-1.5 border rounded-lg text-sm transition-all flex items-center gap-2 ${
              selectedIds.length > 0 
                ? 'border-red-200 text-red-600 hover:bg-red-50' 
                : 'border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-icons text-sm">delete</span> 删除
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto custom-scrollbar">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[1000px]">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    checked={selectedIds.length === records.length && records.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">姓名</th>
                <th className="px-5 py-4">部门</th>
                <th className="px-5 py-4">类型</th>
                <th className="px-5 py-4">补签时间</th>
                <th className="px-5 py-4">操作人</th>
                <th className="px-5 py-4">操作时间</th>
                <th className="px-5 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-400">
                    加载中...
                  </td>
                </tr>
              ) : records.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                    />
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{record.id}</td>
                  <td className="px-5 py-4 font-semibold">{record.employeeName}</td>
                  <td className="px-5 py-4 text-slate-500">{record.deptName}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                      {record.type === 'check_in' ? '补签到' : '补签退'}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {dayjs(record.correctionTime).format('YYYY-MM-DD HH:mm')}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{record.operatorName}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm')}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-4 text-slate-400">
                      <button 
                        onClick={() => handleEdit(record)}
                        className="hover:text-primary transition-colors"
                      >
                        <span className="material-icons text-lg">edit</span>
                      </button>
                      <button className="hover:text-red-500 transition-colors">
                        <span className="material-icons text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {!loading && records.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <span className="material-icons text-6xl mb-2 opacity-20">search_off</span>
              <p>暂无记录</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
        <div>
          显示 <span className="font-semibold text-slate-900">{Math.min((page - 1) * pageSize + 1, total)}</span> 到 <span className="font-semibold text-slate-900">{Math.min(page * pageSize, total)}</span> 条，共 <span className="font-semibold text-slate-900">{total}</span> 条记录
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 flex items-center"
            >
              <span className="material-icons text-xl">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-white font-bold text-xs">{page}</button>
            <button 
              disabled={page * pageSize >= total}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 flex items-center"
            >
              <span className="material-icons text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <CorrectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        record={editingRecord}
        onConfirm={async (time) => {
          if (editingRecord) {
            try {
              logger.info('Update correction time:', { id: editingRecord.id, time });
              await correctionService.updateCorrection(editingRecord.id, { correctionTime: time });
              setIsModalOpen(false);
              loadData(); 
            } catch (err) {
              logger.error('Failed to update correction', err);
            }
          }
        }}
      />

      <PersonnelSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onConfirm={(items) => {
          setSelectedItems(items);
          setIsSelectionModalOpen(false);
        }}
        multiple={false}
        selectType="all"
        title="选择部门或人员"
        initialSelected={selectedItems}
      />
    </div>
  );
};

export default CorrectionView;
