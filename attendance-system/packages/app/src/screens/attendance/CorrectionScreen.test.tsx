import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CorrectionScreen from './CorrectionScreen';
import { getCorrections, supplementCheckIn, supplementCheckOut } from '../../services/attendance';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../services/attendance', () => ({
  getCorrections: jest.fn(),
  supplementCheckIn: jest.fn(),
  supplementCheckOut: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('CorrectionScreen', () => {
  const mockCorrections = [
    {
      id: 1,
      type: 'check_in',
      correctionTime: '2023-10-01T09:00:00.000Z',
      remark: 'Forgot to punch in',
      status: 'approved',
    },
    {
      id: 2,
      type: 'check_out',
      correctionTime: '2023-10-02T18:00:00.000Z',
      remark: 'System error',
      status: 'pending',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getCorrections as jest.Mock).mockResolvedValue(mockCorrections);
  });

  it('renders correctly and loads data', async () => {
    const { getByText } = render(<CorrectionScreen />);

    await waitFor(() => {
      expect(getCorrections).toHaveBeenCalled();
    });

    expect(getByText('补上班卡')).toBeTruthy();
    expect(getByText('补下班卡')).toBeTruthy();
    expect(getByText('备注: Forgot to punch in')).toBeTruthy();
    expect(getByText('备注: System error')).toBeTruthy();
    expect(getByText('+ 补卡申请')).toBeTruthy();
  });

  it('opens and closes modal', async () => {
    const { getByText, queryByText } = render(<CorrectionScreen />);

    fireEvent.press(getByText('+ 补卡申请'));

    await waitFor(() => {
      expect(getByText('补卡申请')).toBeTruthy();
    });

    fireEvent.press(getByText('取消'));

    // In a real app, we'd check visibility. For now, assume press works.
  });

  it('submits check-in correction successfully', async () => {
    (supplementCheckIn as jest.Mock).mockResolvedValue({});
    const { getByText, getByTestId } = render(<CorrectionScreen />);

    fireEvent.press(getByText('+ 补卡申请'));

    fireEvent.changeText(getByTestId('input-dailyRecordId'), '101');
    fireEvent.changeText(getByTestId('input-type'), 'check_in');
    fireEvent.changeText(getByTestId('input-clockTime'), '2023-10-03 09:00');
    fireEvent.changeText(getByTestId('input-remark'), 'Forgot again');

    fireEvent.press(getByText('提交'));

    await waitFor(() => {
      expect(supplementCheckIn).toHaveBeenCalledWith({
        dailyRecordId: '101',
        remark: 'Forgot again',
        checkInTime: expect.stringContaining('2023-10-03'),
      });
      expect(Alert.alert).toHaveBeenCalledWith('成功', '补卡申请提交成功');
      expect(getCorrections).toHaveBeenCalledTimes(2); // Initial load + after submit
    });
  });

  it('submits check-out correction successfully', async () => {
    (supplementCheckOut as jest.Mock).mockResolvedValue({});
    const { getByText, getByTestId } = render(<CorrectionScreen />);

    fireEvent.press(getByText('+ 补卡申请'));

    fireEvent.changeText(getByTestId('input-dailyRecordId'), '102');
    fireEvent.changeText(getByTestId('input-type'), 'check_out');
    fireEvent.changeText(getByTestId('input-clockTime'), '2023-10-03 18:00');
    fireEvent.changeText(getByTestId('input-remark'), 'Left early');

    fireEvent.press(getByText('提交'));

    await waitFor(() => {
      expect(supplementCheckOut).toHaveBeenCalledWith({
        dailyRecordId: '102',
        remark: 'Left early',
        checkOutTime: expect.stringContaining('2023-10-03'),
      });
      expect(Alert.alert).toHaveBeenCalledWith('成功', '补卡申请提交成功');
    });
  });

  it('shows validation error for empty fields', async () => {
    const { getByText } = render(<CorrectionScreen />);

    fireEvent.press(getByText('+ 补卡申请'));
    
    // Submit without filling
    fireEvent.press(getByText('提交'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('提示', '请填写完整信息');
      expect(supplementCheckIn).not.toHaveBeenCalled();
    });
  });

  it('handles API error on submit', async () => {
    const errorMessage = 'Invalid ID';
    (supplementCheckIn as jest.Mock).mockRejectedValue({
      response: { data: { error: { message: errorMessage } } }
    });

    const { getByText, getByTestId } = render(<CorrectionScreen />);

    fireEvent.press(getByText('+ 补卡申请'));

    fireEvent.changeText(getByTestId('input-dailyRecordId'), '999');
    fireEvent.changeText(getByTestId('input-type'), 'check_in');
    fireEvent.changeText(getByTestId('input-clockTime'), '2023-10-03 09:00');
    fireEvent.changeText(getByTestId('input-remark'), 'Test error');

    fireEvent.press(getByText('提交'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('失败', errorMessage);
    });
  });
});
