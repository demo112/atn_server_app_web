import { screen, waitFor } from '@testing-library/react';
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
  cancelLeave: vi.fn(),
}));

// Mock Antd message
const { mockMessage } = vi.hoisted(() => ({
  mockMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: mockMessage,
    Modal: {
      ...actual.Modal,
      confirm: vi.fn(({ onOk }) => onOk()),
    },
  };
});

// Helper to fill form
const fillLeaveForm = async (user: any) => {
  // Employee ID
  const empInput = screen.getByLabelText('员工ID');
  await user.type(empInput, '102');

  // Type (Select) - click label to focus then pick option
  const typeSelect = screen.getByLabelText('请假类型');
  await user.click(typeSelect);
  // Find option in portal
  const option = await screen.findByText('病假'); 
  await user.click(option);

  // Time Range - Antd RangePicker
  // Finding inputs by class or role is tricky. 
  // We'll use getByPlaceholderText if possible, or getAllByRole('textbox') inside the form.
  const dateInputs = screen.getAllByPlaceholderText(/日期/); // Assuming Chinese locale default
  if (dateInputs.length >= 2) {
    // Input date strings
    await user.click(dateInputs[0]);
    await user.type(dateInputs[0], '2023-10-10 09:00');
    await user.keyboard('{Enter}');
    
    await user.click(dateInputs[1]);
    await user.type(dateInputs[1], '2023-10-11 18:00');
    await user.keyboard('{Enter}');
  }

  // Reason
  const reasonInput = screen.getByLabelText('请假原因');
  await user.type(reasonInput, 'Sick leave');
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
      expect(screen.getByText('Vacation')).toBeInTheDocument();
      expect(screen.getByText('年假')).toBeInTheDocument();
    });
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
      expect(mockMessage.success).toHaveBeenCalledWith('创建成功');
    });
  });

  it('handles business logic error (insufficient balance)', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.createLeave).mockRejectedValue(new Error('Insufficient leave balance'));

    renderWithProviders(<LeavePage />);

    await user.click(screen.getByText('申请请假'));

    await fillLeaveForm(user);

    await user.click(screen.getByText('确 定'));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalled();
    });
  });
});
