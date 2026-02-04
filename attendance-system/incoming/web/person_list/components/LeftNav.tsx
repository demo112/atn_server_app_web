
import React from 'react';

const LeftNav: React.FC = () => {
  return (
    <aside className="w-48 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark flex flex-col flex-shrink-0">
      <nav className="py-4">
        <a className="flex items-center px-6 py-3 text-sm bg-blue-50 dark:bg-blue-900/30 text-primary border-r-4 border-primary font-medium" href="#">
          <span>人员管理</span>
          <span className="material-icons-round text-sm ml-auto">chevron_right</span>
        </a>
      </nav>
    </aside>
  );
};

export default LeftNav;
