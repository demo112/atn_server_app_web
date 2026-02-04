
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-14 bg-blue-600 text-white flex items-center justify-between px-6 sticky top-0 z-50 shrink-0 shadow-lg">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-3xl">cloud_queue</span>
          <span className="text-xl font-bold tracking-tight">Cloud Attendance</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 h-14">
          <a className="opacity-80 hover:opacity-100 transition-opacity text-sm font-medium" href="#">Dashboard</a>
          <a className="relative font-semibold text-sm h-full flex items-center px-1" href="#">
            Attendance Management
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-t-full"></div>
          </a>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <button className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-sm flex items-center space-x-2 border border-white/20 transition-colors">
            <span>Team Mode</span>
            <span className="material-icons text-sm">expand_more</span>
          </button>
        </div>
        <div className="h-8 w-px bg-white/20"></div>
        <div className="flex items-center space-x-4">
          <button className="text-sm hidden sm:inline opacity-80 hover:opacity-100">Help</button>
          <div className="relative cursor-pointer group">
            <img 
              alt="User avatar" 
              className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white/60 transition-all" 
              src="https://picsum.photos/seed/attendance/100/100" 
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
