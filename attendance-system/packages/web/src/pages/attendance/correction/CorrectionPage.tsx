import React from 'react';
import CorrectionView from './components/CorrectionView';

const CorrectionPage: React.FC = () => {
  return (
    <div className="flex h-full bg-slate-50">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* View Title/Breadcrumb */}
        <div className="bg-white border-b border-slate-100 px-8 py-5">
          <h1 className="text-xl font-bold text-slate-900">补签记录</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span className="material-icons text-sm">info</span>
            查看、检索和管理所有员工的历史手工补签记录。
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <CorrectionView />
        </div>
      </main>
    </div>
  );
};

export default CorrectionPage;
