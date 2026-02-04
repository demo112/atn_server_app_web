import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ClockInScreen from './ClockInScreen';
import { clockIn, getClockRecords } from '../../services/attendance';
import { getUser } from '../../utils/auth';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../services/attendance', () => ({
  clockIn: jest.fn(),
  getClockRecords: jest.fn(),
}));

// Mock utils
jest.mock('../../utils/auth', () => ({
  getUser: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ClockInScreen', () => {
  const mockUser = { employeeId: 123, username: 'test_user' };
  const mockRecords = [
    {
      id: 1,
      employeeId: 123,
      clockTime: new Date().toISOString(),
      type: 'sign_in',
      source: 'app',
      location: { address: 'Office' }
    }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (getUser as jest.Mock).mockResolvedValue(mockUser);
    (getClockRecords as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly', async () => {
    const { getByText } = render(<ClockInScreen />);
    
    // Wait for user load and initial records load
    await waitFor(() => {
        expect(getUser).toHaveBeenCalled();
        expect(getClockRecords).toHaveBeenCalled();
    });
    
    expect(getByText('上班打卡')).toBeTruthy();
    expect(getByText('下班打卡')).toBeTruthy();
  });

  it('loads today records on mount', async () => {
    (getClockRecords as jest.Mock).mockResolvedValue(mockRecords);
    
    const { getByText } = render(<ClockInScreen />);

    await waitFor(() => {
      expect(getClockRecords).toHaveBeenCalled();
      expect(getByText('上班')).toBeTruthy();
      expect(getByText('Office')).toBeTruthy();
    });
  });

  it('handles clock in success', async () => {
    (clockIn as jest.Mock).mockResolvedValue({ id: 2 });
    
    const { getByText } = render(<ClockInScreen />);
    
    // Wait for user load effect to complete
    await waitFor(() => {
      expect(getUser).toHaveBeenCalled();
      expect(getClockRecords).toHaveBeenCalled();
    });

    const clockInBtn = getByText('上班打卡');
    fireEvent.press(clockInBtn);

    await waitFor(() => {
      expect(clockIn).toHaveBeenCalledWith(expect.objectContaining({
        employeeId: 123,
        type: 'sign_in',
        source: 'app'
      }));
      expect(Alert.alert).toHaveBeenCalledWith('成功', expect.stringContaining('打卡成功'));
      expect(getClockRecords).toHaveBeenCalledTimes(2); // Initial + After clock in
    });
  });

  it('handles clock in failure', async () => {
    const error = new Error('Network Error');
    (clockIn as jest.Mock).mockRejectedValue(error);
    
    const { getByText } = render(<ClockInScreen />);
    
    const clockInBtn = getByText('上班打卡');
    fireEvent.press(clockInBtn);

    await waitFor(() => {
      expect(clockIn).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('失败', expect.any(String));
    });
  });

  it('prevents duplicate submission while loading', async () => {
    // Mock clockIn to take some time
    (clockIn as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const { getByText } = render(<ClockInScreen />);
    
    // Wait for initial load to prevent act warnings
    await waitFor(() => {
      expect(getClockRecords).toHaveBeenCalled();
    });

    const clockInBtn = getByText('上班打卡');
    
    fireEvent.press(clockInBtn);
    fireEvent.press(clockInBtn);
    
    // Since loading state disables the button (usually), we check if the button is disabled or logic prevents it
    // If logic relies on 'loading' state disabling the button:
    // fireEvent.press might still fire if we don't check disabled prop, but implementation should handle it.
    // Let's check call count.
    
    expect(clockIn).toHaveBeenCalledTimes(1);
  });
});
