
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ShiftTable from './components/ShiftTable';
import AddShiftModal from './components/AddShiftModal';
import { Shift } from './types';

const INITIAL_SHIFTS: Shift[] = [
  { id: 1, name: 'Standard Morning Shift', startTime: '09:00', endTime: '18:00' }
];

const App: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddShift = useCallback((newShift: Omit<Shift, 'id'>) => {
    setShifts(prev => [
      ...prev,
      { ...newShift, id: prev.length > 0 ? Math.max(...prev.map(s => s.id)) + 1 : 1 }
    ]);
    setIsModalOpen(false);
  }, []);

  const handleDeleteShift = useCallback((id: number) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  }, []);

  const filteredShifts = shifts.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
          {/* Main Content Area */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm z-10">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <span className="material-icons text-lg mr-1">add</span>
                <span className="font-medium">Add Shift</span>
              </button>
              <button 
                onClick={() => setShifts(INITIAL_SHIFTS)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
                title="Reset to default"
              >
                <span className="material-icons text-lg">refresh</span>
              </button>
            </div>
            
            <div className="relative w-full max-w-xs group">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-500 transition-colors">search</span>
              <input 
                type="text" 
                placeholder="Search shift name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex-1 p-6 overflow-auto">
            <ShiftTable 
              shifts={filteredShifts} 
              onDelete={handleDeleteShift}
            />
          </div>
        </main>
      </div>

      <AddShiftModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleAddShift}
      />
    </div>
  );
};

export default App;
