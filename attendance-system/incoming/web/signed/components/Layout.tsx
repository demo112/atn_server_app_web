
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('考勤管理');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="bg-primary-header h-12 flex items-center justify-between px-4 text-white shrink-0 z-50">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-2xl">cloud_queue</span>
            <span className="font-bold text-lg tracking-tight">宇视云</span>
          </div>
          <nav className="hidden lg:flex space-x-1">
            {['首页', '门禁管理', '考勤管理', '人员管理'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm transition-all relative ${
                  activeTab === tab 
                    ? 'bg-white/20 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white' 
                    : 'hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-1 rounded cursor-pointer hover:bg-white/20">
            <span>团队模式 atnd01_de...</span>
            <span className="material-icons text-xs">expand_more</span>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="material-icons text-sm">person</span>
            </div>
            <span className="hidden md:inline">管理员</span>
            <span className="material-icons text-xs">expand_more</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="hover:underline">帮助</button>
            <button className="hover:underline">开放平台</button>
            <button className="hover:underline">宇视官网</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-52 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="py-2 overflow-y-auto custom-scrollbar flex-1">
            <div className="px-4 py-3 text-sm text-slate-600 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center">
                <span className="material-icons text-lg mr-2">settings</span>
                <span>考勤配置</span>
              </div>
              <span className="material-icons text-xs">chevron_right</span>
            </div>

            <div className="bg-slate-100/50">
              <div className="px-4 py-3 text-sm font-semibold text-slate-900 flex items-center justify-between border-l-4 border-primary">
                <div className="flex items-center">
                  <span className="material-icons text-lg mr-2 text-primary">pending_actions</span>
                  <span>考勤处理</span>
                </div>
                <span className="material-icons text-xs">expand_more</span>
              </div>
              <div className="bg-white">
                <a href="#" className="block pl-11 pr-4 py-2.5 text-sm text-slate-600 hover:text-primary">请假处理</a>
                <a href="#" className="block pl-11 pr-4 py-2.5 text-sm text-primary font-medium bg-blue-50/50 border-r-2 border-primary">补签处理</a>
                <a href="#" className="block pl-11 pr-4 py-2.5 text-sm text-slate-600 hover:text-primary">补签记录</a>
              </div>
            </div>

            <div className="px-4 py-3 text-sm text-slate-600 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
              <div className="flex items-center">
                <span className="material-icons text-lg mr-2">bar_chart</span>
                <span>考勤统计</span>
              </div>
              <span className="material-icons text-xs">chevron_right</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
