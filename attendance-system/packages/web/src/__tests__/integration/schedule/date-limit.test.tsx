import { render, screen, fireEvent } from '@testing-library/react';
import { ScheduleDialog } from '../../../pages/attendance/schedule/components/ScheduleDialog';
import { BatchScheduleDialog } from '../../../pages/attendance/schedule/components/BatchScheduleDialog';
import { vi } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('../../../services/attendanceService', () => ({
  attendanceService: {
    getShifts: vi.fn().mockResolvedValue([
      { id: 1, name: '早班', startTime: '09:00', endTime: '18:00' }
    ]),
    createSchedule: vi.fn().mockResolvedValue({ success: true }),
    batchCreateSchedules: vi.fn().mockResolvedValue({ success: true })
  }
}));

vi.mock('../../../services/employeeService', () => ({
  employeeService: {
    getEmployees: vi.fn().mockResolvedValue([
      { id: 1, name: '张三', employeeNo: 'EMP001' }
    ])
  }
}));

vi.mock('../../../components/common/StandardModal', () => ({
  StandardModal: ({ children, title, isOpen, onClose, onConfirm }: any) => (
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <button onClick={onClose}>Close</button>
        {children}
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null
  )
}));

vi.mock('../../../components/common/ToastProvider', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    }
  })
}));

describe('ScheduleDialog Date Limits', () => {
  it('applies min and max attributes to date inputs in Single Schedule Dialog', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <ScheduleDialog 
        isOpen={true} 
        onClose={handleClose} 
        onSuccess={handleSuccess} 
      />
    );

    const startDateInput = screen.getByLabelText('开始日期');
    const endDateInput = screen.getByLabelText('结束日期');

    // Initial state: empty, so no limits
    expect(startDateInput).toHaveAttribute('type', 'date');
    expect(endDateInput).toHaveAttribute('type', 'date');

    // Set Start Date -> End Date should have min
    fireEvent.change(startDateInput, { target: { value: '2023-01-10' } });
    expect(endDateInput).toHaveAttribute('min', '2023-01-10');

    // Set End Date -> Start Date should have max
    fireEvent.change(endDateInput, { target: { value: '2023-01-20' } });
    expect(startDateInput).toHaveAttribute('max', '2023-01-20');
  });

  it('applies min and max attributes to date inputs in Batch Schedule Dialog', () => {
    const handleClose = vi.fn();
    const handleSuccess = vi.fn();

    render(
      <BatchScheduleDialog 
        isOpen={true} 
        onClose={handleClose} 
        onSuccess={handleSuccess}
        deptId={1}
      />
    );

    const startDateInput = screen.getByLabelText('开始日期');
    const endDateInput = screen.getByLabelText('结束日期');

    // Initial state
    expect(startDateInput).toHaveAttribute('type', 'date');
    expect(endDateInput).toHaveAttribute('type', 'date');

    // Set Start Date -> End Date should have min
    fireEvent.change(startDateInput, { target: { value: '2023-02-10' } });
    expect(endDateInput).toHaveAttribute('min', '2023-02-10');

    // Set End Date -> Start Date should have max
    fireEvent.change(endDateInput, { target: { value: '2023-02-20' } });
    expect(startDateInput).toHaveAttribute('max', '2023-02-20');
  });
});
