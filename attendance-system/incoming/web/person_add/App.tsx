
import React, { useState } from 'react';
import AddPersonModal from './components/AddPersonModal';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background UI Simulation */}
      <div className={`fixed inset-0 z-0 transition-opacity duration-300 ${isModalOpen ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
        <header className="h-14 bg-primary flex items-center px-4 justify-between shadow-md">
          <div className="flex items-center space-x-8">
            <div className="flex items-center text-white font-bold text-xl cursor-default">
              <span className="material-icons mr-2">cloud</span>宇视云
            </div>
            <nav className="flex space-x-6 text-white/80 text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">首页</span>
              <span className="hover:text-white cursor-pointer transition-colors">设备管理</span>
              <span className="hover:text-white cursor-pointer transition-colors">考勤管理</span>
              <span className="text-white border-b-2 border-white pb-1 font-medium">人员管理</span>
            </nav>
          </div>
          <div className="flex items-center space-x-4 text-white">
            <span className="material-icons text-xl cursor-pointer">notifications</span>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center border border-white/20">
                <span className="material-icons text-sm">person</span>
              </div>
              <span className="text-sm">Admin</span>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-56px)]">
          <aside className="w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 transition-colors">
            <div className="space-y-4">
              <div className="text-primary font-medium flex items-center justify-between cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded">
                人员管理 <span className="material-icons text-sm">chevron_right</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                人员审核 <span className="material-icons text-sm">chevron_right</span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors">
                审核记录 <span className="material-icons text-sm">chevron_right</span>
              </div>
            </div>
          </aside>
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="bg-white dark:bg-gray-800 h-full rounded shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
               <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-600 shadow-md transition-all active:scale-95 flex items-center"
               >
                 <span className="material-icons mr-2">person_add</span>
                 添加人员
               </button>
            </div>
          </main>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
           <AddPersonModal onClose={() => setIsModalOpen(false)} />
        </div>
      )}

      {/* Dark Mode Toggle Toggle */}
      <div className="fixed bottom-4 right-4 z-[60]">
        <button 
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform active:scale-90"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? (
            <span className="material-icons block">light_mode</span>
          ) : (
            <span className="material-icons block">dark_mode</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default App;
