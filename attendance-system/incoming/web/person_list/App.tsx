
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import LeftNav from './components/LeftNav';
import DepartmentSidebar from './components/DepartmentSidebar';
import PersonnelDashboard from './components/PersonnelDashboard';
import { Person, FilterParams } from './types';

const INITIAL_DATA: Person[] = [
  {
    id: '6CS9Nu',
    name: '张三',
    contact: '18660845170',
    gender: 'Unknown',
    department: 'atnd01_dev的宇视云/技术部',
    idType: '身份证',
    idNumber: '-',
    status: 'Active'
  },
  {
    id: '447',
    name: '李四',
    contact: '15764151362',
    gender: 'Unknown',
    department: 'atnd01_dev的宇视云/行政部',
    idType: '身份证',
    idNumber: '-',
    status: 'Active'
  },
  {
    id: '11',
    name: '王五',
    contact: '18666555514',
    gender: 'Unknown',
    department: 'atnd01_dev的宇视云',
    idType: '身份证',
    idNumber: '-',
    status: 'Active'
  },
  {
    id: '12',
    name: '赵六',
    contact: '18912345678',
    gender: 'Male',
    department: 'atnd01_dev的宇视云/技术部',
    idType: '身份证',
    idNumber: '370102199001011234',
    status: 'Active'
  }
];

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(INITIAL_DATA);
  const [filters, setFilters] = useState<FilterParams>({ name: '', idNumber: '', status: 'all' });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(filters.name.toLowerCase());
      const idMatch = p.idNumber.toLowerCase().includes(filters.idNumber.toLowerCase());
      const statusMatch = filters.status === 'all' || p.status.toLowerCase() === filters.status.toLowerCase();
      return nameMatch && idMatch && statusMatch;
    });
  }, [people, filters]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <DepartmentSidebar />
        <PersonnelDashboard 
          data={filteredPeople} 
          onFilterChange={setFilters}
          onDelete={(id) => setPeople(prev => prev.filter(p => p.id !== id))}
        />
      </div>

      {/* Dark Mode Toggle Float */}
      <button 
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-slate-800 shadow-lg rounded-full flex items-center justify-center text-slate-600 dark:text-amber-400 hover:scale-110 transition active:scale-95 z-50 border border-slate-200 dark:border-slate-700"
      >
        <span className="material-icons-round">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
      </button>
    </div>
  );
};

export default App;
