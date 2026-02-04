
import React, { useState } from 'react';
import { AttendanceRecord } from '../types';
import { MOCK_RECORDS } from '../constants.tsx';

interface CorrectionViewProps {
  onEdit: (record: AttendanceRecord) => void;
}

const CorrectionView: React.FC<CorrectionViewProps> = ({ onEdit }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_RECORDS);

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
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
              <input className="w-32 border-none text-sm px-3 focus:ring-0" type="text" defaultValue="2026-01-06" />
              <span className="text-slate-300">-</span>
              <input className="w-32 border-none text-sm px-3 focus:ring-0" type="text" defaultValue="2026-02-04" />
              <div className="px-2 text-slate-400 border-l border-slate-100">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <button className="text-slate-500 hover:text-primary transition-colors">昨天</button>
              <button className="text-slate-500 hover:text-primary transition-colors">最近7天</button>
              <button className="text-primary font-semibold border-b-2 border-primary">最近30天</button>
              <button className="text-slate-500 hover:text-primary transition-colors">当月</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">处理类型</span>
            <select className="h-9 text-sm border-slate-200 rounded-lg focus:ring-primary focus:border-primary pr-10">
              <option>全部类型</option>
              <option>补签申请</option>
              <option>假勤调整</option>
            </select>
          </div>

          <div className="flex-1 flex justify-end gap-3 min-w-fit">
            <button className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-primary/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">search</span> 查询
            </button>
            <button className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">refresh</span> 重置
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
            <span className="material-symbols-outlined text-sm">delete</span> 删除
          </button>
        </div>
        {/* Download and Print buttons removed as requested */}
      </div>

      {/* Table Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto custom-scrollbar">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
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
                <th className="px-5 py-4">工号</th>
                <th className="px-5 py-4">姓名</th>
                <th className="px-5 py-4">部门</th>
                <th className="px-5 py-4">类型</th>
                <th className="px-5 py-4">补签时间</th>
                <th className="px-5 py-4">操作时间</th>
                <th className="px-5 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                    />
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">{record.staffId}</td>
                  <td className="px-5 py-4 font-semibold">{record.name}</td>
                  <td className="px-5 py-4 text-slate-500">{record.department}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                      {record.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">{record.correctionTime}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{record.operationTime}</td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex justify-center gap-4 text-slate-400">
                      <button 
                        onClick={() => onEdit(record)}
                        className="hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-2 opacity-20">search_off</span>
              <p>暂无记录</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
        <div>
          显示 <span className="font-semibold text-slate-900">1</span> 到 <span className="font-semibold text-slate-900">{records.length}</span> 条，共 <span className="font-semibold text-slate-900">{records.length}</span> 条记录
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>显示:</span>
            <select className="text-xs border-slate-200 rounded-md py-1 px-2 focus:ring-primary focus:border-primary">
              <option>20 条/页</option>
              <option>50 条/页</option>
              <option>100 条/页</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary text-white font-bold text-xs">1</button>
            <button className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>跳至</span>
            <input className="w-12 h-8 text-center border-slate-200 rounded-md focus:ring-primary focus:border-primary text-xs" type="number" defaultValue="1" />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectionView;
