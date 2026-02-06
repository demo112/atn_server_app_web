import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LeaveScreen from './LeaveScreen';
import { getLeaves, createLeave, cancelLeave } from '../../services/attendance';
import { getEmployees } from '../../services/employee';
import { useAuth } from '../../utils/auth';
import { Alert } from 'react-native';
import { LeaveType } from '@attendance/shared';

// Mock services
jest.mock('../../services/attendance', () => ({
  getLeaves: jest.fn(),
  createLeave: jest.fn(),
  cancelLeave: jest.fn(),
}));

jest.mock('../../services/employee', () => ({
  getEmployees: jest.fn(),
}));

jest.mock('../../utils/auth', () => ({
  useAuth: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('LeaveScreen', () => {
  const mockLeaves = [
    {
      id: 1,
      type: 'annual',
      startTime: '2023-10-01T09:00:00.000Z',
      endTime: '2023-10-01T18:00:00.000Z',
      reason: 'Vacation',
      status: 'approved',
    },
    {
      id: 2,
      type: 'sick',
      startTime: '2023-10-02T09:00:00.000Z',
      endTime: '2023-10-02T18:00:00.000Z',
      reason: 'Sick leave',
      status: 'pending',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getLeaves as jest.Mock).mockResolvedValue(mockLeaves);
    (useAuth as jest.Mock).mockReturnValue({ user: { role: 'user' } });
    (getEmployees as jest.Mock).mockResolvedValue({ items: [] });
  });

  it('renders correctly and loads data', async () => {
    const { getByText } = render(<LeaveScreen />);

    await waitFor(() => {
      expect(getLeaves).toHaveBeenCalled();
    });

    expect(getByText('annual')).toBeTruthy();
    expect(getByText('sick')).toBeTruthy();
    expect(getByText('+ 新申请')).toBeTruthy();
  });

  it('submits new leave application', async () => {
    (createLeave as jest.Mock).mockResolvedValue({});
    const { getByText, getByTestId, queryByTestId } = render(<LeaveScreen />);

    fireEvent.press(getByText('+ 新申请'));

    fireEvent.press(getByTestId('input-type-annual'));
    fireEvent.changeText(getByTestId('input-startTime'), '2023-10-05 09:00');
    fireEvent.changeText(getByTestId('input-endTime'), '2023-10-05 18:00');
    fireEvent.changeText(getByTestId('input-reason'), 'Personal matter');

    fireEvent.press(getByText('提交'));

    await waitFor(() => {
      expect(createLeave).toHaveBeenCalledWith({
        employeeId: 0,
        type: 'annual',
        startTime: expect.stringContaining('2023-10-05'),
        endTime: expect.stringContaining('2023-10-05'),
        reason: 'Personal matter',
      });
      expect(Alert.alert).toHaveBeenCalledWith('成功', '申请提交成功');
      expect(getLeaves).toHaveBeenCalledTimes(2);
    });
    
    // Wait for loading to finish
    await waitFor(() => expect(queryByTestId('loading')).toBeNull());
  });

  it('allows admin to select employee', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { role: 'admin' } });
    const mockEmployees = [
      { id: 101, name: 'John Doe', employeeNo: 'E101', deptName: 'IT' },
      { id: 102, name: 'Jane Smith', employeeNo: 'E102', deptName: 'HR' },
    ];
    (getEmployees as jest.Mock).mockResolvedValue({ items: mockEmployees });
    (createLeave as jest.Mock).mockResolvedValue({});

    const { getByText, getByTestId } = render(<LeaveScreen />);

    // Wait for employees to load
    await waitFor(() => {
      expect(getEmployees).toHaveBeenCalled();
    });

    fireEvent.press(getByText('+ 新申请'));

    // Should see "选择员工" button
    expect(getByText('选择员工')).toBeTruthy();

    // Open employee selection
    fireEvent.press(getByText('选择员工'));

    // Select John Doe
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });
    fireEvent.press(getByText('John Doe'));

    // Fill form
    fireEvent.changeText(getByTestId('input-type'), 'annual');
    fireEvent.changeText(getByTestId('input-startTime'), '2023-10-05 09:00');
    fireEvent.changeText(getByTestId('input-endTime'), '2023-10-05 18:00');
    fireEvent.changeText(getByTestId('input-reason'), 'Admin applying for John');

    fireEvent.press(getByText('提交'));

    await waitFor(() => {
      expect(createLeave).toHaveBeenCalledWith({
        employeeId: 101,
        type: 'annual',
        startTime: expect.stringContaining('2023-10-05'),
        endTime: expect.stringContaining('2023-10-05'),
        reason: 'Admin applying for John',
      });
      expect(Alert.alert).toHaveBeenCalledWith('成功', '申请提交成功');
    });
  });

  it('validates that end time is not before start time', async () => {
    const { getByText, getByTestId } = render(<LeaveScreen />);

    fireEvent.press(getByText('+ 新申请'));

    fireEvent.press(getByTestId('input-type-annual'));
    fireEvent.changeText(getByTestId('input-startTime'), '2023-10-02 09:00');
    fireEvent.changeText(getByTestId('input-endTime'), '2023-10-01 09:00');
    fireEvent.changeText(getByTestId('input-reason'), 'Invalid date');

    fireEvent.press(getByText('提交'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('提示', '结束时间不能早于开始时间');
      expect(createLeave).not.toHaveBeenCalled();
    });
  });

  it('cancels a pending leave', async () => {
    (cancelLeave as jest.Mock).mockResolvedValue({});
    const { getByText, queryByTestId } = render(<LeaveScreen />);

    await waitFor(() => {
      expect(getByText('撤销')).toBeTruthy();
    });

    fireEvent.press(getByText('撤销'));

    // Check alert
    expect(Alert.alert).toHaveBeenCalledWith(
      '确认撤销',
      '确定要撤销这条请假申请吗？',
      expect.any(Array)
    );

    // Simulate clicking "确定" in Alert
    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = buttons.find((b: any) => b.text === '确定');
    await confirmButton.onPress();

    expect(cancelLeave).toHaveBeenCalledWith(2);
    await waitFor(() => expect(getLeaves).toHaveBeenCalledTimes(2)); // Initial + after cancel
    await waitFor(() => expect(queryByTestId('loading')).toBeNull());
  });
});
