import { screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import LeavePage from '../../../pages/attendance/leave/LeavePage';
import * as leaveService from '@/services/attendance/leave';
import { LeaveType, LeaveStatus } from '@attendance/shared';
import userEvent from '@testing-library/user-event';

// Mock services
vi.mock('@/services/attendance/leave', () => ({
  getLeaves: vi.fn(),
  createLeave: vi.fn(),
  cancelLeave: vi.fn(),
}));

// Helper to fill form
const fillLeaveForm = async (user: any) => {
  console.log('fillLeaveForm: starting');
  // Wait for modal to be visible (StandardModal uses role dialog)
  const modal = await screen.findByRole('dialog');
  console.log('fillLeaveForm: modal found');

  // Employee ID
  const empInput = screen.getByPlaceholderText('请输入员工ID');
  await user.type(empInput, '102');
  console.log('fillLeaveForm: empId filled');

  // Type (Select)
  const typeSelect = screen.getByRole('combobox');
  await user.selectOptions(typeSelect, LeaveType.sick);
  console.log('fillLeaveForm: type selected');

  // Reason
  const reasonInput = screen.getByPlaceholderText('请输入请假/出差事由');
  await user.type(reasonInput, 'Sick leave');
  console.log('fillLeaveForm: reason filled');

  // Date Range
  // Tailwind implementation uses input[type="datetime-local"]
  const inputs = modal.querySelectorAll('input[type="datetime-local"]');
  console.log(`fillLeaveForm: found ${inputs.length} datetime inputs`);
  
  if (inputs.length >= 2) {
      // First input (Start)
      // Note: datetime-local inputs require specific format for testing? or just string
      // userEvent might need '2023-10-10T09:00'
      await user.clear(inputs[0]);
      await user.type(inputs[0], '2023-10-10T09:00');
      console.log('fillLeaveForm: start date filled');
      
      // Second input (End)
      await user.clear(inputs[1]);
      await user.type(inputs[1], '2023-10-11T18:00');
      console.log('fillLeaveForm: end date filled');
  } else {
      console.warn('fillLeaveForm: Could not find datetime inputs');
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
      // StandardModal title is h3
      expect(screen.getByText('申请请假', { selector: 'h3' })).toBeVisible();
    });

    // Fill form
    await fillLeaveForm(user);
    
    // Submit
    const submitBtn = screen.getByText('确定');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(leaveService.createLeave).toHaveBeenCalled();
      // Expect toast message
      expect(screen.getByText('创建成功')).toBeInTheDocument();
    }, { timeout: 15000 });
  }, 20000); // Test timeout

  it('handles business logic error (insufficient balance)', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.createLeave).mockRejectedValue(new Error('Insufficient leave balance'));

    renderWithProviders(<LeavePage />);

    await user.click(screen.getByText('申请请假'));

    // Fill form
    await fillLeaveForm(user);

    await user.click(screen.getByText('确定'));

    await waitFor(() => {
      // Expect error toast
      expect(screen.getByText('操作失败')).toBeInTheDocument();
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
    
    // Confirm dialog (StandardModal)
    // Title '确认撤销'
    const confirmTitle = await screen.findByText('确认撤销', { selector: 'h3' });
    expect(confirmTitle).toBeVisible();

    const confirmBtn = await screen.findByText('确定');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(leaveService.cancelLeave).toHaveBeenCalledWith(1);
      expect(screen.getByText('撤销成功')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
