
import React, { useState, useMemo } from 'react';
import { Tab, Shift } from './types';
import Header from './components/Header';
import ShiftList from './components/ShiftList';
import BottomNav from './components/BottomNav';
import AddShiftModal from './components/AddShiftModal';

const INITIAL_SHIFTS: Shift[] = [
  { id: '7', name: '默认班次_7', startTime: '09:00', endTime: '18:00' },
  { id: '6', name: '默认班次_6', startTime: '09:00', endTime: '18:00' },
  { id: '5', name: '默认班次_5', startTime: '09:00', endTime: '18:00' },
  { id: '4', name: '默认班次_4', startTime: '09:00', endTime: '18:00' },
  { id: '3', name: '默认班次_3', startTime: '09:00', endTime: '18:00' },
  { id: '2', name: '默认班次_2', startTime: '09:00', endTime: '18:00' },
  { id: '1', name: '默认班次_1', startTime: '09:00', endTime: '18:00' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ShiftConfig);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredShifts = useMemo(() => {
    return shifts.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.startTime}-${s.endTime}`.includes(searchTerm)
    );
  }, [shifts, searchTerm]);

  const handleAddShift = (newShift: Omit<Shift, 'id'>) => {
    const shift: Shift = {
      ...newShift,
      id: Date.now().toString()
    };
    setShifts([shift, ...shifts]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-background-light dark:bg-background-dark shadow-2xl">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <main className="flex-1 px-4 py-4 space-y-4 overflow-y-auto pb-24">
        {activeTab === Tab.ShiftConfig ? (
          <>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-card-light dark:bg-card-dark rounded-xl py-4 flex items-center justify-center space-x-2 shadow-sm active:opacity-70 active:scale-[0.98] transition-all"
            >
              <span className="material-icons-outlined text-primary">add</span>
              <span className="font-semibold text-[17px]">添加班次</span>
            </button>

            <div className="px-1 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                班次列表 
                <span className="text-emerald-500 dark:text-emerald-400 ml-1 font-semibold">
                  ({shifts.length}/100)
                </span>
              </h2>
            </div>

            <ShiftList shifts={filteredShifts} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <span className="material-icons-outlined text-4xl mb-2">construction</span>
            <p>考勤组配置模块开发中</p>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <AddShiftModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddShift} 
      />
    </div>
  );
};

export default App;
