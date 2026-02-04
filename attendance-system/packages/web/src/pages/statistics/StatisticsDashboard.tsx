import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from './mockData';

const StatisticsDashboard: React.FC = () => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'daily_stats',
      titlePrimary: '每日',
      titleSecondary: '统计表',
      description: '记录员工每日打卡时间，结果，出勤等详细数据，方便日常管理。',
      image: IMAGES.DAILY_STATS,
      path: '/statistics/daily-stats'
    },
    {
      id: 'monthly_summary',
      titlePrimary: '月度',
      titleSecondary: '汇总表',
      description: '打卡月度概况，每日结果，假期等汇总统计，供薪酬结算使用。',
      image: IMAGES.MONTHLY_SUMMARY,
      path: '/statistics/monthly-summary-report'
    },
    {
      id: 'monthly_card',
      titlePrimary: '月度',
      titleSecondary: '卡表',
      description: '记录员工每月打卡时间，结果，出勤等详细展示，可视化展示打卡趋势。',
      image: IMAGES.MONTHLY_CARD,
      path: '/statistics/monthly-card-report'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-slate-800">统计报表</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div 
            key={card.id}
            className="rounded-xl border border-blue-100 p-8 shadow-sm hover:shadow-md transition-all flex justify-between group overflow-hidden relative bg-gradient-to-br from-white to-blue-50/30"
          >
            <div className="flex-1 pr-4 relative z-10">
              <h2 className="text-3xl font-bold mb-3">
                <span className="text-blue-600">{card.titlePrimary}</span>
                <span className="text-slate-800">{card.titleSecondary}</span>
              </h2>
              <p className="text-slate-500 mb-8 max-w-xs">{card.description}</p>
              <button 
                onClick={() => navigate(card.path)}
                className="text-blue-600 font-medium flex items-center hover:opacity-80 transition-opacity"
              >
                查看/导出 <span className="material-icons-outlined text-sm ml-1">chevron_right</span>
              </button>
            </div>
            
            <div className="w-48 h-48 flex items-center justify-center relative z-10 transform group-hover:scale-110 transition-transform duration-500">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full"></div>
                <img alt={`${card.titlePrimary} Icon`} className="w-32 h-32 relative z-10 object-contain" src={card.image} />
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsDashboard;
