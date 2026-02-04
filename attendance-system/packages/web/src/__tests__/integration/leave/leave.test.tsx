import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import LeavePage from '../../../pages/attendance/leave/LeavePage';
import * as leaveService from '../../../services/leave';
import { LeaveType, LeaveStatus } from '@attendance/shared';
import userEvent from '@testing-library/user-event';
import { message, Modal } from 'antd';

// Mock services
vi.mock('../../../services/leave', () => ({
  getLeaves: vi.fn(),
  createLeave: vi.fn(),
  cancelLeave: vi.fn(),
}));

// Helper to fill form
const fillLeaveForm = async (user: any) => {
  // Employee ID
  const empInput = screen.getByPlaceholderText('员工ID'); // In form it might be placeholder
  // Check LeaveDialog.tsx: <Form.Item label="员工ID"> <Input ... /> </Form.Item>
  // Antd Form.Item label associates with input if name is provided.
  // We can try getByLabelText '员工ID'.
  
  // Wait, LeaveDialog has:
  // <Form.Item name="employeeId" label="员工ID" ...> <Input ... /> </Form.Item>
  // So getByLabelText should work.
  const empInputs = screen.getAllByLabelText('员工ID');
  // There might be multiple because LeavePage filter also has "员工ID" placeholder/input?
  // LeavePage has <Input placeholder="员工ID" ... /> but no label.
  // LeaveDialog has Form.Item with label "员工ID".
  // So getByLabelText should return the one in Dialog.
  if (empInputs.length > 0) {
     await user.type(empInputs[0], '102');
  } else {
     // Fallback
     const inputs = screen.getAllByRole('spinbutton'); // type="number"
     // or just getByLabelText if it's unique
     const input = screen.getByLabelText('员工ID');
     await user.type(input, '102');
  }

  // Type (Select)
  const typeSelect = screen.getByLabelText('请假类型');
  await user.click(typeSelect);
  // Find option in portal
  // Antd Select options render in a portal.
  const option = await screen.findByText('病假', {}, { timeout: 3000 }); 
  await user.click(option);

  // Time Range - Antd RangePicker
  const dateInputs = screen.getAllByPlaceholderText('请选择日期'); // Default placeholder?
  // LeaveDialog: <DatePicker.RangePicker showTime />
  // Usually placeholders are "Start date" "End date" or similar in English, or "开始日期" "结束日期" in Chinese locale.
  // If locale is not set, it might be English.
  // Let's try to find by class or role.
  // Or just query generic textboxes.
  const inputs = screen.getAllByRole('textbox');
  // Inputs in dialog: EmployeeID (number), Type (select - combobox), RangePicker (2 inputs), Reason (textarea/input).
  
  // Let's assume date inputs are present.
  // If we can't easily select dates in Antd RangePicker via userEvent, we might need to mock DatePicker or use fireEvent.
  // For now, let's try basic interaction.
  
  // Simpler approach: Manually set values if possible, or skip detailed form filling if it's too flaky without specialized helpers.
  // But we need to submit.
  
  // For this test, let's try to focus on logic.
  // If filling form fails, I'll mock the Form component or use a simpler test.
  // Let's try to fill Reason at least.
  const reasonInput = screen.getByLabelText('请假原因');
  await user.type(reasonInput, 'Sick leave');

  // For dates, it's tricky with userEvent and Antd.
  // Maybe we can skip validation for dates in the test if we mock the service to just succeed?
  // But the Form validates required fields.
  // <Form.Item name="timeRange" label="时间范围" rules={[{ required: true, message: '请选择时间范围' }]}>
  
  // We MUST fill dates.
  // Antd RangePicker inputs allow typing.
  // Let's try to find them by placeholder.
  // Default placeholders: 'Start date', 'End date'.
  const startInput = screen.getByPlaceholderText('开始日期');
  await user.type(startInput, '2023-10-10 09:00');
  await user.keyboard('{Enter}');
  
  const endInput = screen.getByPlaceholderText('结束日期');
  await user.type(endInput, '2023-10-11 18:00');
  await user.keyboard('{Enter}');
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

    // Fill form
    // Note: Antd Select/DatePicker interactions are complex in JSDOM. 
    // We might encounter issues here.
    // If so, we might need to mock `LeaveDialog` itself or use a more integration-test friendly approach (e.g. Playwright) 
    // or just mock the Form components.
    // But let's try filling it first.
    
    const empInput = screen.getByLabelText('员工ID');
    await user.type(empInput, '102');

    // Select Type
    const typeSelect = screen.getByLabelText('请假类型');
    await user.click(typeSelect);
    const option = await screen.findByText('病假', {}, { timeout: 3000 }); 
    await user.click(option);
    
    // Date Range
    // Try to find by placeholder. If Chinese locale is not loaded, it might be "Start date".
    // Let's query all inputs and filter/guess.
    const inputs = screen.getAllByRole('textbox');
    // Index 0: Filter EmployeeID
    // Index 1: Filter Select (hidden/read-only)
    // Index 2: Filter Range Start
    // Index 3: Filter Range End
    // ... Inside Modal ...
    // Index ?: Modal EmployeeID
    // Index ?: Modal Select
    // Index ?: Modal Range Start
    // Index ?: Modal Range End
    // Index ?: Modal Reason
    
    // This is fragile.
    // Better: Mock LeaveDialog? No, we want to test integration.
    // Better: Mock Antd Form or Components?
    
    // Let's assume we can find them.
    // If not, I will update the test to mock LeaveDialog.
    
    const reasonInput = screen.getByLabelText('请假原因');
    await user.type(reasonInput, 'Sick leave');
    
    // Dates - let's try typing into the visible inputs
    const rangeInputs = screen.getAllByPlaceholderText('开始日期'); // Try Chinese first
    if (rangeInputs.length > 0) {
        // The one in modal is likely the last one or visible one
        const modalStart = rangeInputs[rangeInputs.length - 1];
        await user.click(modalStart);
        await user.type(modalStart, '2023-10-10 09:00');
        await user.keyboard('{Enter}');
    }
    
    const rangeEndInputs = screen.getAllByPlaceholderText('结束日期');
    if (rangeEndInputs.length > 0) {
        const modalEnd = rangeEndInputs[rangeEndInputs.length - 1];
        await user.click(modalEnd);
        await user.type(modalEnd, '2023-10-11 18:00');
        await user.keyboard('{Enter}');
    }

    // Submit
    const submitBtn = screen.getByText('确 定');
    await user.click(submitBtn);

    await waitFor(() => {
      // If validation fails, createLeave won't be called.
      expect(leaveService.createLeave).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith('创建成功');
    });
  });

  it('handles business logic error (insufficient balance)', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.createLeave).mockRejectedValue(new Error('Insufficient leave balance'));

    renderWithProviders(<LeavePage />);

    await user.click(screen.getByText('申请请假'));

    // Fill minimal valid form to trigger submit
    const empInput = screen.getByLabelText('员工ID');
    await user.type(empInput, '102');
    
    const typeSelect = screen.getByLabelText('请假类型');
    await user.click(typeSelect);
    const option = await screen.findByText('病假', {}, { timeout: 3000 }); 
    await user.click(option);
    
    const reasonInput = screen.getByLabelText('请假原因');
    await user.type(reasonInput, 'Sick leave');

    const rangeInputs = screen.getAllByPlaceholderText('开始日期');
    if (rangeInputs.length > 0) {
        const modalStart = rangeInputs[rangeInputs.length - 1];
        await user.click(modalStart);
        await user.type(modalStart, '2023-10-10 09:00');
        await user.keyboard('{Enter}');
    }
    const rangeEndInputs = screen.getAllByPlaceholderText('结束日期');
    if (rangeEndInputs.length > 0) {
        const modalEnd = rangeEndInputs[rangeEndInputs.length - 1];
        await user.click(modalEnd);
        await user.type(modalEnd, '2023-10-11 18:00');
        await user.keyboard('{Enter}');
    }

    await user.click(screen.getByText('确 定'));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
  });

  it('cancels a leave request', async () => {
    const user = userEvent.setup();
    vi.mocked(leaveService.cancelLeave).mockResolvedValue();

    renderWithProviders(<LeavePage />);

    // Wait for list to load
    await waitFor(() => {
      expect(screen.getByText('Vacation')).toBeInTheDocument();
    });

    const cancelLink = screen.getByText('撤销');
    await user.click(cancelLink);

    await waitFor(() => {
      expect(leaveService.cancelLeave).toHaveBeenCalledWith(1);
      expect(message.success).toHaveBeenCalledWith('撤销成功');
    });
  });
});
