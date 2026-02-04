import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { UserListScreen } from './UserListScreen';
import { getUsers, deleteUser } from '../../../services/user';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../../services/user', () => ({
  getUsers: jest.fn(),
  deleteUser: jest.fn(),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (callback: any) => React.useEffect(callback, []),
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('UserListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly and loads data', async () => {
    (getUsers as jest.Mock).mockResolvedValue({
      items: [
        { id: 1, username: 'admin', role: 'admin', status: 'active', createdAt: '2023-01-01' },
        { id: 2, username: 'user1', role: 'user', status: 'active', createdAt: '2023-01-02' },
      ],
      total: 2,
    });

    const { getByText, getByPlaceholderText } = render(<UserListScreen />);

    expect(getByPlaceholderText('搜索用户名')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('admin')).toBeTruthy();
      expect(getByText('user1')).toBeTruthy();
    });

    expect(getUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('handles search with debounce', async () => {
    (getUsers as jest.Mock).mockResolvedValue({ items: [], total: 0 });

    const { getByPlaceholderText } = render(<UserListScreen />);

    // Wait for initial load
    await waitFor(() => {
      expect(getUsers).toHaveBeenCalled();
    });
    (getUsers as jest.Mock).mockClear();

    const searchInput = getByPlaceholderText('搜索用户名');
    fireEvent.changeText(searchInput, 'admin');

    // Debounce wait
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getUsers).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'admin' }));
    });
  });

  it('handles delete flow', async () => {
    (getUsers as jest.Mock).mockResolvedValue({
      items: [{ id: 1, username: 'user_to_delete', role: 'user' }],
      total: 1,
    });
    (deleteUser as jest.Mock).mockResolvedValue(true);

    const { getByText } = render(<UserListScreen />);

    await waitFor(() => {
      expect(getByText('user_to_delete')).toBeTruthy();
    });

    // Trigger long press
    fireEvent(getByText('user_to_delete'), 'onLongPress');

    expect(Alert.alert).toHaveBeenCalled();
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    // Find the call that opens the ActionSheet (title is username)
    const actionSheetCall = alertCalls.find(call => call[1] === 'user_to_delete');
    expect(actionSheetCall).toBeTruthy();
    
    // Simulate delete option press
    const buttons = actionSheetCall[2];
    const deleteButton = buttons.find((b: any) => b.text === '删除');
    deleteButton.onPress();

    // Confirm delete alert
    expect(Alert.alert).toHaveBeenCalledWith('确认删除', expect.stringContaining('user_to_delete'), expect.any(Array));
    const confirmCall = (Alert.alert as jest.Mock).mock.calls.find(call => call[0] === '确认删除');
    const confirmButton = confirmCall[2].find((b: any) => b.text === '删除');
    
    await act(async () => {
      await confirmButton.onPress();
    });

    expect(deleteUser).toHaveBeenCalledWith(1);
    expect(getUsers).toHaveBeenCalledTimes(2); // Initial + Reload
  });

  it('handles navigation to edit', async () => {
    (getUsers as jest.Mock).mockResolvedValue({
      items: [{ id: 1, username: 'user1', role: 'user' }],
      total: 1,
    });

    const { getByText } = render(<UserListScreen />);

    await waitFor(() => {
      expect(getByText('user1')).toBeTruthy();
    });

    fireEvent.press(getByText('user1'));
    expect(mockNavigate).toHaveBeenCalledWith('UserEdit', { id: 1 });
  });

  it('handles navigation to create', async () => {
    (getUsers as jest.Mock).mockResolvedValue({ items: [], total: 0 });
    const { getByText } = render(<UserListScreen />);
    
    // The + button
    fireEvent.press(getByText('+'));
    expect(mockNavigate).toHaveBeenCalledWith('UserEdit');
  });
});
