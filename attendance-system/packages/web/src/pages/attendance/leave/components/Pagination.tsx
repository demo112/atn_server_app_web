import React from 'react';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ current, pageSize, total, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onChange(newPage, pageSize);
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(1, Number(e.target.value));
  };

  return (
    <footer className="p-4 bg-white dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between text-sm text-gray-500 dark:text-gray-400 shrink-0 gap-4 rounded-b-lg shadow-sm">
      <div className="flex items-center gap-4">
        <span className="whitespace-nowrap">
          显示 {total > 0 ? start : 0} - {end} 条，共 {total} 条记录
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded font-medium shadow-sm">
            {current}
          </button>
          
          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current >= totalPages}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={handleSizeChange}
            className="px-2 py-1 text-sm border-gray-300 dark:border-gray-600 bg-transparent rounded focus:ring-primary dark:text-gray-200 transition-all cursor-pointer"
          >
            <option value={10}>10 条/页</option>
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
            <option value={100}>100 条/页</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span>前往</span>
          <input
            className="w-12 px-2 py-1 text-center text-sm border-gray-300 dark:border-gray-600 bg-transparent rounded focus:ring-primary dark:text-gray-200 transition-all"
            type="number"
            min={1}
            max={totalPages}
            value={current}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) handlePageChange(val);
            }}
          />
          <span>页</span>
        </div>
      </div>
    </footer>
  );
};

export default Pagination;
