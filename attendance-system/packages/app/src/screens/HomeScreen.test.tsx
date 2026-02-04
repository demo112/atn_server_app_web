import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { getUser, clearAuth } from '../utils/auth';
import { logger } from '../utils/logger';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    reset: mockReset,
  }),
}));

// Mock utils
jest.mock('../utils/auth', () => ({
  getUser: jest.fn(),
  clearAuth: jest.fn(),
}));

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and loads user info', async () => {
    (getUser as jest.Mock).mockResolvedValue({ name: 'Test User', role: 'USER' });

    const { getByText } = render(<HomeScreen />);

    expect(getByText('考勤助手')).toBeTruthy();
    expect(getByText('常用功能')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('你好, Test User')).toBeTruthy();
    });
    
    // Check common functions
    expect(getByText('考勤打卡')).toBeTruthy();
    expect(getByText('请假/出差')).toBeTruthy();
    expect(getByText('补卡申请')).toBeTruthy();
    expect(getByText('考勤记录')).toBeTruthy();
    expect(getByText('我的排班')).toBeTruthy();
  });

  it('shows admin features for ADMIN role', async () => {
    (getUser as jest.Mock).mockResolvedValue({ name: 'Admin User', role: 'ADMIN' });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('你好, Admin User')).toBeTruthy();
    });

    expect(getByText('管理中心')).toBeTruthy();
    expect(getByText('部门管理')).toBeTruthy();
    expect(getByText('人员管理')).toBeTruthy();
    expect(getByText('用户管理')).toBeTruthy();
  });

  it('does not show admin features for USER role', async () => {
    (getUser as jest.Mock).mockResolvedValue({ name: 'Normal User', role: 'USER' });

    const { queryByText, getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('你好, Normal User')).toBeTruthy();
    });

    expect(queryByText('管理中心')).toBeNull();
    expect(queryByText('部门管理')).toBeNull();
  });

  it('handles navigation correctly', async () => {
    (getUser as jest.Mock).mockResolvedValue({ name: 'Test User', role: 'USER' });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getUser).toHaveBeenCalled();
    });

    fireEvent.press(getByText('考勤打卡'));
    expect(mockNavigate).toHaveBeenCalledWith('ClockIn');

    fireEvent.press(getByText('请假/出差'));
    expect(mockNavigate).toHaveBeenCalledWith('Leave');
    
    fireEvent.press(getByText('补卡申请'));
    expect(mockNavigate).toHaveBeenCalledWith('Correction');

    fireEvent.press(getByText('考勤记录'));
    expect(mockNavigate).toHaveBeenCalledWith('History');

    fireEvent.press(getByText('我的排班'));
    expect(mockNavigate).toHaveBeenCalledWith('Schedule');
  });

  it('handles logout correctly', async () => {
    (getUser as jest.Mock).mockResolvedValue({ name: 'Test User', role: 'USER' });

    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getUser).toHaveBeenCalled();
    });

    fireEvent.press(getByText('退出'));

    await waitFor(() => {
      expect(clearAuth).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    });
  });

  it('handles user load error', async () => {
    const error = new Error('Load failed');
    (getUser as jest.Mock).mockRejectedValue(error);

    render(<HomeScreen />);

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });
});
