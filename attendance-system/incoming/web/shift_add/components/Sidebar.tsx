
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 z-20">
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
            <span>Attendance Config</span>
            <span className="material-icons text-sm">expand_more</span>
          </div>
          <ul className="space-y-1">
            <li>
              <a className="flex items-center px-4 py-2 text-primary bg-blue-50 font-medium rounded-md" href="#">
                <span className="text-sm">Shift Configuration</span>
              </a>
            </li>
            <li>
              <a className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors" href="#">
                <span className="text-sm">Attendance Group</span>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
            <span>Attendance Processing</span>
            <span className="material-icons text-sm">chevron_right</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
