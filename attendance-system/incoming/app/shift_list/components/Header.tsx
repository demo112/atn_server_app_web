
import React from 'react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 pt-12 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="flex items-center space-x-3">
        <button className="p-1 -ml-2 flex items-center justify-center text-primary active:opacity-50 transition-opacity">
          <span className="material-icons-outlined text-3xl">chevron_left</span>
        </button>
        <div className="flex-1 relative">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            className="w-full bg-slate-200/50 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-[17px] focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 transition-all outline-none"
            placeholder="搜索"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
