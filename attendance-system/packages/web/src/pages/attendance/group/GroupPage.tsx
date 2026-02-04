import React, { useState } from 'react';
import GroupList from './components/GroupList';
import GroupForm from './components/GroupForm';
import { ViewType, AttendanceGroup } from './types';

const GroupPage: React.FC = () => {
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
    setEditingGroup(null);
  };

  return (
    <div className="h-full bg-white lg:bg-gray-50">
      {currentView === ViewType.LIST ? (
        <GroupList 
          onAdd={handleAddClick} 
          onEdit={handleEditClick}
        />
      ) : (
        <GroupForm 
          group={editingGroup} 
          onCancel={handleBackToList}
          onSave={handleBackToList}
        />
      )}
    </div>
  );
};

export default GroupPage;
