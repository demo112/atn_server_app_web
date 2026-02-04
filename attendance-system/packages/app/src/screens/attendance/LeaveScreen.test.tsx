import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LeaveScreen from './LeaveScreen';
import { getLeaves, createLeave, cancelLeave } from '../../services/attendance';
import { Alert } from 'react-native';
import { LeaveType } from '@attendance/shared';

// Mock services
jest.mock('../../services/attendance', () => ({
  getLeaves: jest.fn(),
  createLeave: jest.fn(),
  cancelLeave: jest.fn(),
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
  });

  it('renders correctly and loads data', async () => {
    const { getByText } = render(<LeaveScreen />);

    await waitFor(() => {
      expect(getLeaves).toHaveBeenCalled();
    });

    expect(getByText('annual')).toBeTruthy();
    expect(getByText('sick')).toBeTruthy();
    expect(getByText('Vacation')).toBeTruthy();
    expect(getByText('Sick leave')).toBeTruthy();
    expect(getByText('+ 新申请')).toBeTruthy();
  });

  it('submits new leave application', async () => {
    (createLeave as jest.Mock).mockResolvedValue({});
    const { getByText, getByTestId, queryByTestId } = render(<LeaveScreen />);

    fireEvent.press(getByText('+ 新申请'));

    fireEvent.changeText(getByTestId('input-type'), 'annual');
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

  it('validates that end time is not before start time', async () => {
    const { getByText, getByTestId } = render(<LeaveScreen />);

    fireEvent.press(getByText('+ 新申请'));

    fireEvent.changeText(getByTestId('input-type'), 'annual');
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
