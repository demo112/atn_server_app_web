import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { authService } from '../../services/auth';
import { Alert } from 'react-native';

// Mock navigation
const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    replace: mockReplace,
  }),
}));

// Mock authService
jest.mock('../../services/auth', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    expect(getByText('考勤系统')).toBeTruthy();
    expect(getByPlaceholderText('请输入用户名')).toBeTruthy();
    expect(getByPlaceholderText('请输入密码')).toBeTruthy();
    expect(getByText('登录')).toBeTruthy();
  });

  it('shows alert when inputs are empty', () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText('登录'));
    
    expect(Alert.alert).toHaveBeenCalledWith('错误', '请输入用户名和密码');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls login service and navigates on success', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'fake-token',
      user: { id: 1, username: 'test' }
    });

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('请输入用户名'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('请输入密码'), 'password');
    fireEvent.press(getByText('登录'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password'
      });
      expect(mockReplace).toHaveBeenCalledWith('Home');
    });
  });

  it('shows error alert on login failure', async () => {
    const error = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValue(error);

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('请输入用户名'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('请输入密码'), 'wrong');
    fireEvent.press(getByText('登录'));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('登录失败', 'Invalid credentials');
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
