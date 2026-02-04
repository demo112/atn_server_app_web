import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { EmployeeListScreen } from './EmployeeListScreen';
import { getEmployees, deleteEmployee } from '../../../services/employee';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../../services/employee', () => ({
  getEmployees: jest.fn(),
  deleteEmployee: jest.fn(),
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

describe('EmployeeListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly and loads data', async () => {
    (getEmployees as jest.Mock).mockResolvedValue({
      items: [
        { id: 1, name: 'John Doe', employeeNo: 'E001', deptName: 'IT' },
        { id: 2, name: 'Jane Smith', employeeNo: 'E002', deptName: 'HR' },
      ],
      total: 2,
    });

    const { getByText, getByPlaceholderText } = render(<EmployeeListScreen />);

    expect(getByPlaceholderText('搜索姓名、工号、手机号')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Jane Smith')).toBeTruthy();
    });

    expect(getEmployees).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it('handles search with debounce', async () => {
    (getEmployees as jest.Mock).mockResolvedValue({ items: [], total: 0 });

    const { getByPlaceholderText } = render(<EmployeeListScreen />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(getEmployees).toHaveBeenCalled();
    });
    (getEmployees as jest.Mock).mockClear();

    const searchInput = getByPlaceholderText('搜索姓名、工号、手机号');
    fireEvent.changeText(searchInput, 'John');

    // Debounce wait
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getEmployees).toHaveBeenCalledWith(expect.objectContaining({ keyword: 'John' }));
    });
  });

  it('handles delete flow', async () => {
    (getEmployees as jest.Mock).mockResolvedValue({
      items: [{ id: 1, name: 'John Doe', employeeNo: 'E001' }],
      total: 1,
    });
    (deleteEmployee as jest.Mock).mockResolvedValue(true);

    const { getByText } = render(<EmployeeListScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    // Trigger long press
    fireEvent(getByText('John Doe'), 'onLongPress');

    expect(Alert.alert).toHaveBeenCalled();
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    // Find the call that opens the ActionSheet
    const actionSheetCall = alertCalls.find(call => call[1] === 'John Doe');
    expect(actionSheetCall).toBeTruthy();
    
    // Find Delete button in ActionSheet
    const deleteBtn = actionSheetCall[2].find((btn: any) => btn.text === '删除');
    
    // Press delete in ActionSheet
    await act(async () => {
        deleteBtn.onPress();
    });

    // Should trigger confirmation alert
    const confirmCall = (Alert.alert as jest.Mock).mock.calls[alertCalls.length - 1];
    expect(confirmCall[0]).toBe('确认删除');
    
    // Find Delete button in Confirmation
    const confirmDeleteBtn = confirmCall[2].find((btn: any) => btn.text === '删除');
    
    // Press confirm delete
    await act(async () => {
        await confirmDeleteBtn.onPress();
    });

    expect(deleteEmployee).toHaveBeenCalledWith(1);
    expect(getEmployees).toHaveBeenCalledTimes(2); // Initial + after delete
  });

  it('handles navigation to edit', async () => {
     (getEmployees as jest.Mock).mockResolvedValue({
      items: [{ id: 1, name: 'John Doe' }],
      total: 1,
    });

    const { getByText } = render(<EmployeeListScreen />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });

    fireEvent.press(getByText('John Doe'));
    expect(mockNavigate).toHaveBeenCalledWith('EmployeeEdit', { id: 1 });
  });

  it('handles navigation to create', () => {
    (getEmployees as jest.Mock).mockResolvedValue({ items: [], total: 0 });
    const { getByText } = render(<EmployeeListScreen />);
    
    fireEvent.press(getByText('+'));
    expect(mockNavigate).toHaveBeenCalledWith('EmployeeEdit');
  });
});
