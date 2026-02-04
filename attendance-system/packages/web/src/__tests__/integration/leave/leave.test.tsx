import { screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import LeavePage from '../../../pages/attendance/leave/LeavePage';
import * as leaveService from '@/services/leave';
import { LeaveType, LeaveStatus } from '@attendance/shared';
import userEvent from '@testing-library/user-event';
import { message, Modal } from 'antd';

// Mock services
vi.mock('@/services/leave', () => ({
  getLeaves: vi.fn(),
  createLeave: vi.fn(),
  cancelLeave: vi.fn(),
}));

// Helper to fill form
const fillLeaveForm = async (user: any) => {
  console.log('fillLeaveForm: starting');
  // Wait for modal to be visible
  const modal = await screen.findByRole('dialog');
  console.log('fillLeaveForm: modal found');

  // Employee ID
  const empInput = within(modal).getByLabelText('员工ID');
  await user.type(empInput, '102');
  console.log('fillLeaveForm: empId filled');

  // Type (Select)
  const typeSelect = within(modal).getByLabelText('请假类型');
  await user.click(typeSelect);
  // Options are in a portal, outside modal
  const option = await screen.findByText('病假', {}, { timeout: 3000 }); 
  await user.click(option);
  console.log('fillLeaveForm: type selected');

  // Reason
  const reasonInput = within(modal).getByLabelText('事由');
  await user.type(reasonInput, 'Sick leave');
  console.log('fillLeaveForm: reason filled');

  // Date Range
  // Use class selector to find RangePicker inputs within modal
  // Note: RangePicker has two inputs.
  const pickerInputs = modal.querySelectorAll('.ant-picker-input input');
  console.log(`fillLeaveForm: found ${pickerInputs.length} picker inputs`);
  
  if (pickerInputs.length >= 2) {
      // First input (Start)
      await user.click(pickerInputs[0]);
      await user.type(pickerInputs[0], '2023-10-10 09:00');
      await user.keyboard('{Enter}');
      console.log('fillLeaveForm: start date filled');
      
      // Second input (End)
      await user.click(pickerInputs[1]);
      await user.type(pickerInputs[1], '2023-10-11 18:00');
      await user.keyboard('{Enter}');
      console.log('fillLeaveForm: end date filled');
  } else {
      console.warn('fillLeaveForm: Could not find DatePicker inputs');
  }
};

describe('LeavePage Integration', () => {
  const mockLeaves = {
    items: [
      {
        id: 1,
        employeeId: 101,
        type: LeaveType.annual,
        startTime: '2023-10-01T09:00:00Z',
        endTime: '2023-10-02T18:00:00Z',
        duration: 16,
        reason: 'Vacation',
        status: LeaveStatus.approved,
        createdAt: '2023-09-30T10:00:00Z',
        updatedAt: '2023-09-30T10:00:00Z',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(leaveService.getLeaves).mockResolvedValue(mockLeaves);
    
    // Spy on Antd components
    vi.spyOn(message, 'success').mockImplementation(() => null as any);
    vi.spyOn(message, 'error').mockImplementation(() => null as any);
    vi.spyOn(message, 'warning').mockImplementation(() => null as any);
    
    vi.spyOn(Modal, 'confirm').mockImplementation((config: any) => {
        if (config.onOk) config.onOk();
        return { destroy: vi.fn(), update: vi.fn() } as any;
    });
  });

  it('renders leave list correctly', async () => {
    renderWithProviders(<LeavePage />);

    await waitFor(() => {
      expect(leaveService.getLeaves).toHaveBeenCalled();
      // 'Vacation' (reason) is not in the table columns, so check for '年假' (type) and '101' (employeeId)
      expect(screen.getByText('年假')).toBeInTheDocument();
      expect(screen.getByText('101')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('opens create dialog and submits valid leave request', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.createLeave).mockResolvedValue({ ...mockLeaves.items[0], id: 2 });

    renderWithProviders(<LeavePage />);

    // Click "Apply" button
    const createBtn = screen.getByText('申请请假');
    await user.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('申请请假', { selector: '.ant-modal-title' })).toBeVisible();
    });

    await fillLeaveForm(user);

    // Submit
    const submitBtn = screen.getByText('确 定');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(leaveService.createLeave).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('创建成功');
    }, { timeout: 15000 });
  }, 20000); // Test timeout

  it('handles business logic error (insufficient balance)', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.createLeave).mockRejectedValue(new Error('Insufficient leave balance'));

    renderWithProviders(<LeavePage />);

    await user.click(screen.getByText('申请请假'));

    await fillLeaveForm(user);

    await user.click(screen.getByText('确 定'));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    }, { timeout: 15000 });
  }, 20000); // Test timeout

  it('cancels a leave request', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.cancelLeave).mockResolvedValue();

    renderWithProviders(<LeavePage />);

    // Wait for list to load
    await waitFor(() => {
      expect(screen.getByText('年假')).toBeInTheDocument();
    }, { timeout: 5000 });

    const cancelLink = screen.getByText('撤销');
    await user.click(cancelLink);

    await waitFor(() => {
      expect(leaveService.cancelLeave).toHaveBeenCalledWith(1);
      expect(message.success).toHaveBeenCalledWith('撤销成功');
    }, { timeout: 5000 });
  });
});
