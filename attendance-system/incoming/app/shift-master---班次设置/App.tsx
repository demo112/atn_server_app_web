
import React, { useState, useEffect } from 'react';
import { Shift, AppView } from './types';
import StatusBar from './components/StatusBar';
import ShiftList from './components/ShiftList';
import ShiftEdit from './components/ShiftEdit';

const DEFAULT_SHIFTS: Shift[] = [
  {
    id: '1',
    name: '早班',
    timeSlots: [{
      id: 's1',
      startTime: '09:00',
      endTime: '17:00',
      mustCheckIn: true,
      checkInWindow: '08:30-09:30',
      mustCheckOut: true,
      checkOutWindow: '16:30-17:30'
    }]
  },
  {
    id: '2',
    name: '晚班',
    timeSlots: [{
      id: 's2',
      startTime: '18:00',
      endTime: '02:00',
      mustCheckIn: true,
      checkInWindow: '17:30-18:30',
      mustCheckOut: true,
      checkOutWindow: '01:30-02:30'
    }]
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('list');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('shifts');
    if (saved) {
      setShifts(JSON.parse(saved));
    } else {
      setShifts(DEFAULT_SHIFTS);
    }
  }, []);

  const handleSaveShift = (newShift: Shift) => {
    let updatedShifts;
    if (shifts.find(s => s.id === newShift.id)) {
      updatedShifts = shifts.map(s => s.id === newShift.id ? newShift : s);
    } else {
      updatedShifts = [newShift, ...shifts];
    }
    setShifts(updatedShifts);
    localStorage.setItem('shifts', JSON.stringify(updatedShifts));
    setView('list');
    setSelectedShift(null);
  };

  const handleAddClick = () => {
    setSelectedShift(null);
    setView('edit');
  };

  const handleEditClick = (shift: Shift) => {
    setSelectedShift(shift);
    setView('edit');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-ios-bg">
      <StatusBar />
      
      <div className="flex-1 overflow-hidden relative">
        {view === 'list' ? (
          <ShiftList 
            shifts={shifts}
            onAddShift={handleAddClick}
            onEditShift={handleEditClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ) : (
          <ShiftEdit 
            shift={selectedShift}
            onSave={handleSaveShift}
            onCancel={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
};

export default App;
