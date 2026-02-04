import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { UserEditScreen } from './UserEditScreen';
import { createUser, updateUser, getUserById } from '../../../services/user';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../../services/user', () => ({
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
const mockRoute = { params: {} };

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({ 
      navigate: mockNavigate,
      goBack: mockGoBack,
      setOptions: mockSetOptions,
    }),
    useRoute: () => mockRoute,
    useFocusEffect: (callback: any) => React.useEffect(callback, []),
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('UserEditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute.params = {};
  });

  it('renders correctly in create mode', () => {
    const { getByText, getByPlaceholderText } = render(<UserEditScreen />);

    expect(getByText('用户名 *')).toBeTruthy();
    expect(getByPlaceholderText('请输入用户名')).toBeTruthy();
    expect(getByText('密码 *')).toBeTruthy();
    expect(getByPlaceholderText('请输入密码')).toBeTruthy();
  });

  it('renders correctly in edit mode and loads data', async () => {
    mockRoute.params = { id: 1 };
    (getUserById as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      role: 'user',
      status: 'active',
    });

    const { getByDisplayValue, queryByText } = render(<UserEditScreen />);

    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith(1);
    });

    expect(getByDisplayValue('testuser')).toBeTruthy();
    // Password field should not be visible in edit mode
    expect(queryByText('密码 *')).toBeNull();
  });

  it('validates required fields', async () => {
    const { getByText } = render(<UserEditScreen />);

    // Wait for setOptions to be called
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    // Get the latest call
    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1];
    const headerRight = lastCall[0].headerRight;
    const { getByText: getByTextHeader } = render(headerRight());
    
    fireEvent.press(getByTextHeader('保存'));

    expect(Alert.alert).toHaveBeenCalledWith('提示', '请输入用户名');
  });

  it('creates user successfully', async () => {
    (createUser as jest.Mock).mockResolvedValue({ id: 1 });

    const { getByPlaceholderText } = render(<UserEditScreen />);
    
    fireEvent.changeText(getByPlaceholderText('请输入用户名'), 'newuser');
    fireEvent.changeText(getByPlaceholderText('请输入密码'), 'password123');

    // Wait for update
    await waitFor(() => {
      // Expect multiple calls as we typed
      expect(mockSetOptions.mock.calls.length).toBeGreaterThan(1);
    });

    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1];
    const headerRight = lastCall[0].headerRight;
    const { getByText: getByTextHeader } = render(headerRight());
    
    await act(async () => {
      fireEvent.press(getByTextHeader('保存'));
    });

    expect(createUser).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'password123',
      role: 'user',
    });
    expect(Alert.alert).toHaveBeenCalledWith('成功', '创建成功', expect.any(Array));
  });

  it('updates user successfully', async () => {
    mockRoute.params = { id: 1 };
    (getUserById as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'existinguser',
      role: 'user',
      status: 'active',
    });
    (updateUser as jest.Mock).mockResolvedValue({ id: 1 });

    const { getByDisplayValue } = render(<UserEditScreen />);

    await waitFor(() => {
      expect(getByDisplayValue('existinguser')).toBeTruthy();
    });

    // Wait for update
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();
    });

    const lastCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1];
    const headerRight = lastCall[0].headerRight;
    const { getByText: getByTextHeader } = render(headerRight());
    
    await act(async () => {
      fireEvent.press(getByTextHeader('保存'));
    });

    expect(updateUser).toHaveBeenCalledWith(1, {
      role: 'user',
      status: 'active',
    });
    expect(Alert.alert).toHaveBeenCalledWith('成功', '更新成功', expect.any(Array));
  });
});
