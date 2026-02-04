
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ShiftTable from './components/ShiftTable';
import ShiftModal from './components/ShiftModal';
import { Shift } from './types';

const INITIAL_SHIFTS: Shift[] = [
  {
    id: '1',
    name: 'Morning Shift 1',
    dailyCheckins: 1,
    times: [
      {
        clockIn: '09:00',
        clockOut: '17:00',
        isClockInMandatory: true,
        isClockOutMandatory: true,
        validFromStart: '08:30',
        validFromEnd: '09:30',
        validUntilStart: '16:30',
        validUntilEnd: '17:30',
      }
    ],
    lateGracePeriod: 0,
    earlyLeaveGracePeriod: 0,
    markAbsentIfNoCheckIn: 'Absent',
    markAbsentIfNoCheckOut: 'Absent',
  }
];

export default function App() {
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShifts = shifts.filter(shift => 
    shift.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddShift = (newShift: Shift) => {
    setShifts([...shifts, newShift]);
    setIsModalOpen(false);
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-white relative overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <span className="material-icons text-sm mr-1">add</span> Add
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-700">
                <span className="material-icons text-sm mr-1">refresh</span> Refresh
              </button>
            </div>
            <div className="relative">
              <span className="material-icons absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
              <input
                className="pl-10 pr-4 py-2 border border-gray-300 bg-white rounded w-64 focus:ring-primary focus:border-primary text-sm"
                placeholder="Search shift name..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto border rounded-lg">
            <ShiftTable shifts={filteredShifts} onDelete={handleDeleteShift} />
          </div>

          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span>Total {filteredShifts.length} item{filteredShifts.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" disabled>
                <span className="material-icons text-lg">chevron_left</span>
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded">1</button>
              <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" disabled>
                <span className="material-icons text-lg">chevron_right</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <select className="text-xs border-gray-300 rounded px-2 py-1 bg-white">
                <option>20 Items/Page</option>
              </select>
              <span>Go to</span>
              <input className="w-10 text-center border-gray-300 rounded px-1 py-1 text-xs" type="text" defaultValue="1" />
              <span>Page</span>
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <ShiftModal 
          onClose={() => setIsModalOpen(false)} 
          onConfirm={handleAddShift} 
        />
      )}
    </div>
  );
}
