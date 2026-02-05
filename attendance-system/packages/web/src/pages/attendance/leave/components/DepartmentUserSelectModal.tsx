import React from 'react';
import { EmployeeVo } from '@attendance/shared';
import { PersonnelSelectionModal, SelectionItem } from '@/components/common/PersonnelSelectionModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employee: EmployeeVo) => void;
}

export const DepartmentUserSelectModal: React.FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const handleConfirm = (selected: SelectionItem[]) => {
    if (selected.length > 0 && selected[0].type === 'employee') {
      onSelect(selected[0].data as EmployeeVo);
    }
  };

  return (
    <PersonnelSelectionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      multiple={false}
      selectType="employee"
      title="选择人员"
    />
  );
};
