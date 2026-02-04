
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AttendanceListView from './components/AttendanceListView';
import AttendanceFormView from './components/AttendanceFormView';
import { ViewType, AttendanceGroup } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.LIST);
  const [editingGroup, setEditingGroup] = useState<AttendanceGroup | null>(null);

  const handleAddClick = () => {
    setEditingGroup(null);
    setCurrentView(ViewType.FORM);
  };

  const handleEditClick = (group: AttendanceGroup) => {
    setEditingGroup(group);
    setCurrentView(ViewType.FORM);
  };

  const handleBackToList = () => {
    setCurrentView(ViewType.LIST);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentView={currentView} />
        <main className="flex-1 overflow-y-auto bg-white lg:bg-gray-50">
          {currentView === ViewType.LIST ? (
            <AttendanceListView 
              onAdd={handleAddClick} 
              onEdit={handleEditClick}
            />
          ) : (
            <AttendanceFormView 
              group={editingGroup} 
              onCancel={handleBackToList}
              onSave={handleBackToList}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
