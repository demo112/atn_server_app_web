
import React, { useState } from 'react';

type MenuItem = {
  name: string;
  href: string;
  active?: boolean;
};

type MenuSection = {
  title: string;
  icon: string;
  items: MenuItem[];
  isOpen: boolean;
};

const Sidebar: React.FC = () => {
  const [sections, setSections] = useState<MenuSection[]>([
    {
      title: 'Attendance Processing',
      icon: 'assignment_turned_in',
      isOpen: false,
      items: [
        { name: 'Application Processing', href: '#' },
        { name: 'Correction Processing', href: '#' },
        { name: 'Leave Processing', href: '#' },
      ]
    },
    {
      title: 'Attendance Statistics',
      icon: 'bar_chart',
      isOpen: false,
      items: [
        { name: 'Daily Statistics', href: '#' },
        { name: 'Monthly Statistics', href: '#' },
        { name: 'My Statistics', href: '#' },
        { name: 'Department Statistics', href: '#' },
      ]
    },
    {
      title: 'Attendance Setup',
      icon: 'settings',
      isOpen: true,
      items: [
        { name: 'Attendance Group', href: '#' },
        { name: 'Shift List', href: '#', active: true },
        { name: 'Schedule Management', href: '#' },
        { name: 'Overtime Rules', href: '#' },
        { name: 'Leave Rules', href: '#' },
      ]
    },
    {
      title: 'System Settings',
      icon: 'admin_panel_settings',
      isOpen: false,
      items: [
        { name: 'Global Settings', href: '#' },
        { name: 'Operation Logs', href: '#' },
      ]
    }
  ]);

  const toggleSection = (index: number) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, isOpen: !section.isOpen } : section
    ));
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-full shrink-0 transition-all font-sans">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {sections.map((section, index) => (
            <div key={section.title} className="select-none">
              <button 
                onClick={() => toggleSection(index)}
                className={`flex items-center justify-between w-full p-2.5 rounded-lg transition-colors duration-200 group ${
                  section.isOpen 
                    ? 'text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center">
                  <span className={`material-icons mr-3 text-[20px] transition-colors ${
                    section.isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
                  }`}>{section.icon}</span>
                  <span className="font-semibold text-sm tracking-wide">{section.title}</span>
                </span>
                <span className={`material-icons text-lg text-slate-400 transition-transform duration-200 ${section.isOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${section.isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700 space-y-0.5 py-1">
                  {section.items.map((item) => (
                    <a 
                      key={item.name}
                      href={item.href}
                      className={`block px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                        item.active 
                          ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Storage</p>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">75%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
          750 MB of 1 GB used
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
