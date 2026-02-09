import { screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import LeavePage from '../../../pages/attendance/leave/LeavePage';
import * as leaveService from '../../../services/leave';
import { LeaveType, LeaveStatus } from '@attendance/shared';
import userEvent from '@testing-library/user-event';

// Mock services
vi.mock('../../../services/leave', () => ({
  getLeaves: vi.fn(),
  createLeave: vi.fn(),
  updateLeave: vi.fn(),
  deleteLeave: vi.fn(),
}));

// Helper to fill form
const fillLeaveForm = async (user: any) => {
  console.log('fillLeaveForm: starting');
  // Wait for modal to be visible (StandardModal uses role dialog)
  const modal = await screen.findByRole('dialog');
  console.log('fillLeaveForm: modal found');

  // Employee ID
  // const empInput = within(modal).getByPlaceholderText('请输入员工ID');
  const empInput = within(modal).getByRole('spinbutton');
  await user.clear(empInput);
  await user.type(empInput, '102');
  console.log('fillLeaveForm: empId filled');

  // Type (Select)
  const typeSelect = within(modal).getByRole('combobox');
  await user.selectOptions(typeSelect, LeaveType.sick);
  console.log('fillLeaveForm: type selected');

  // Reason
  // const reasonInput = within(modal).getByPlaceholderText('请输入请假/出差事由');
  const reasonInput = modal.querySelector('textarea');
  if (reasonInput) {
      await user.type(reasonInput, 'Sick leave');
      console.log('fillLeaveForm: reason filled');
  } else {
      throw new Error('Reason textarea not found');
  }

  // Date Range
  // Tailwind implementation uses input[type="datetime-local"]
  const inputs = modal.querySelectorAll('input[type="datetime-local"]');
  console.log(`fillLeaveForm: found ${inputs.length} datetime inputs`);
  
  if (inputs.length >= 2) {
      // First input (Start)
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

// Mock Data
const mockLeaves = [
  {
    id: 1,
    employeeId: 101,
    type: LeaveType.annual,
    startTime: '2023-05-01T09:00:00Z',
    endTime: '2023-05-02T18:00:00Z',
    duration: 16,
    reason: 'Vacation',
    status: LeaveStatus.approved,
    createdAt: '2023-04-20T10:00:00Z',
    updatedAt: '2023-04-20T10:00:00Z',
  },
  {
    id: 2,
    employeeId: 102,
    type: LeaveType.sick,
    startTime: '2023-05-10T09:00:00Z',
    endTime: '2023-05-10T18:00:00Z',
    duration: 8,
    reason: 'Sick leave',
    status: LeaveStatus.pending,
    createdAt: '2023-05-09T08:00:00Z',
    updatedAt: '2023-05-09T08:00:00Z',
  },
];

describe('Leave Integration Test', () => {
  // const user = userEvent.setup();

  beforeEach(() => {
    vi.mocked(leaveService.getLeaves).mockResolvedValue({
      items: mockLeaves,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1
    });
  });

  it('renders leave list correctly', async () => {
    // const user = userEvent.setup(); // unused
    renderWithProviders(<LeavePage />);

    await waitFor(() => {
      expect(leaveService.getLeaves).toHaveBeenCalled();
      // 'Vacation' (reason) is not in the table columns, so check for '年假' (type) and '101' (employeeId)
      const typeElements = screen.getAllByText('年假');
      expect(typeElements.length).toBeGreaterThan(0);
      expect(screen.getAllByText(/101/)[0]).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('opens create dialog and submits valid leave request', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.createLeave).mockResolvedValue({ 
      ...mockLeaves[0], 
      id: 3,
      updatedAt: '2024-03-20 10:00:00' 
    }); // fixed index

    renderWithProviders(<LeavePage />);

    // Click "Apply" button
    const createBtn = screen.getByText('新增记录');
    await user.click(createBtn);

    await waitFor(() => {
      // StandardModal title is h2
      expect(screen.getByRole('heading', { name: '新增记录' })).toBeVisible();
    });

    // Fill form
    await fillLeaveForm(user);
    
    // Submit
    const submitBtn = screen.getByText('保存');
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

    await user.click(screen.getByText('新增记录'));

    // Fill form
    await fillLeaveForm(user);

    await user.click(screen.getByText('保存'));

    await waitFor(() => {
      // Expect error toast
      expect(screen.getByText('创建失败')).toBeInTheDocument();
    }, { timeout: 15000 });
  }, 20000); // Test timeout


});
