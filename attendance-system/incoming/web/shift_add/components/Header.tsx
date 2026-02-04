
import React from 'react';

const Header: React.FC = () => {
  return (
    <nav className="bg-primary px-6 py-3 flex items-center justify-between shadow-md z-30">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2 text-white font-bold text-xl cursor-pointer">
          <span className="material-icons">cloud_circle</span>
          <span>CloudAttend</span>
        </div>
        <div className="flex space-x-6 text-white/90 text-sm font-medium">
          <a className="hover:text-white transition-colors" href="#">Home</a>
          <a className="px-4 py-1 bg-white/20 rounded-md text-white" href="#">Attendance Management</a>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-white">
        <div className="flex items-center space-x-1 text-xs bg-white/10 px-2 py-1 rounded cursor-pointer hover:bg-white/20">
          <span>Team Mode</span>
          <span className="material-icons text-sm">expand_more</span>
        </div>
        <span className="material-icons cursor-pointer hover:text-blue-100">help_outline</span>
        <div className="flex items-center space-x-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white/30 overflow-hidden">
            <img 
              alt="User avatar" 
              src="https://picsum.photos/32/32"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
