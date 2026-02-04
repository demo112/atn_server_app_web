import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../LoginScreen';
import { authService } from '../../../services/auth';

// Mock navigation
const mockNavigation = {
  replace: jest.fn(),
  navigate: jest.fn(),
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

// Mock authService
jest.mock('../../../services/auth', () => ({
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
  });

  it('shows error when fields are empty', () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('登录'));
    
    expect(Alert.alert).toHaveBeenCalledWith('错误', '请输入用户名和密码');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls login service on valid input and navigates home', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
        success: true,
        data: { token: 'abc', user: { id: 1, username: 'test' } }
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
    });

    await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });

  it('shows error on login failure', async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    const { getByText, getByPlaceholderText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('请输入用户名'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('请输入密码'), 'wrong');
    fireEvent.press(getByText('登录'));

    await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
    });

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('登录失败', 'Invalid credentials');
    });
  });
});
