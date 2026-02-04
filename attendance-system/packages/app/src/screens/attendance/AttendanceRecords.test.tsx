import React from 'react';
import { render, fireEvent, waitFor, act, screen } from '@testing-library/react-native';
import AttendanceRecords from './AttendanceRecords';
import { getDailyRecordDetails } from '../../services/statistics';
import { useAuth } from '../../utils/auth';
import { logger } from '../../utils/logger';

// Mock dependencies
jest.mock('../../services/statistics', () => ({
  getDailyRecordDetails: jest.fn(),
}));
// ... rest of mocks
jest.mock('../../utils/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => {
      return React.createElement(View, { testID: 'mock-datetimepicker', ...props });
    },
  };
});

describe('AttendanceRecords', () => {
// ... setup
  const mockUser = { id: 1, name: 'Test User' };
  const mockRecords = {
    items: [
      {
        id: '1',
        employeeName: 'John Doe',
        employeeNo: 'E001',
        deptName: 'IT',
        workDate: '2023-10-01',
        status: 'normal',
        shiftName: 'Morning',
        checkInTime: '2023-10-01T09:00:00Z',
        checkOutTime: '2023-10-01T18:00:00Z',
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
      },
      {
        id: '2',
        employeeName: 'Jane Smith',
        employeeNo: 'E002',
        deptName: 'HR',
        workDate: '2023-10-01',
        status: 'late',
        shiftName: 'Morning',
        checkInTime: '2023-10-01T09:15:00Z',
        checkOutTime: '2023-10-01T18:00:00Z',
        lateMinutes: 15,
        earlyLeaveMinutes: 0,
      }
    ],
    total: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getDailyRecordDetails as jest.Mock).mockResolvedValue(mockRecords);
  });

  it('renders correctly and loads initial data', async () => {
    render(<AttendanceRecords />);

    expect(screen.getByPlaceholderText('搜索姓名')).toBeTruthy();
    expect(screen.getByText('筛选')).toBeTruthy();

    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        pageSize: 20,
      }));
    });

    expect(screen.getByText('John Doe (E001)')).toBeTruthy();
    expect(screen.getByText('正常')).toBeTruthy();
    expect(screen.getByText('Jane Smith (E002)')).toBeTruthy();
    expect(screen.getByText('迟到')).toBeTruthy();
    expect(screen.getByText('迟到 15分')).toBeTruthy();
  });

  it('handles search', async () => {
    render(<AttendanceRecords />);
    const searchInput = screen.getByPlaceholderText('搜索姓名');

    fireEvent.changeText(searchInput, 'John');
    // Ensure state updates
    await waitFor(() => expect(searchInput.props.value).toBe('John'));
    
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledWith(expect.objectContaining({
        employeeName: 'John',
        page: 1
      }));
    });
  });

  it('handles filter by status', async () => {
    const { getByTestId } = render(<AttendanceRecords />);
    
    // Open filter modal
    fireEvent.press(screen.getByText('筛选'));

    // Select 'late' status
    const lateChip = getByTestId('filter-chip-late');
    await act(async () => {
      fireEvent.press(lateChip);
    });

    // Wait for state update and API call
    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledWith(expect.objectContaining({
        status: 'late',
        page: 1
      }));
    });

    // Confirm (just closes modal)
    const confirmBtn = getByTestId('filter-confirm-btn');
    fireEvent.press(confirmBtn);
  });

  it('handles pagination (load more)', async () => {
    // Setup for multiple pages
    (getDailyRecordDetails as jest.Mock)
      .mockResolvedValueOnce({ ...mockRecords, totalPages: 2 }) // First call
      .mockResolvedValueOnce({ // Second call
        items: [{
          id: '3',
          employeeName: 'Bob',
          status: 'normal',
          workDate: '2023-10-02'
        }],
        totalPages: 2
      });

    const { getByTestId } = render(<AttendanceRecords />);
    
    await waitFor(() => expect(getDailyRecordDetails).toHaveBeenCalledTimes(1));

    const list = getByTestId('records-list');
    
    // Trigger onEndReached
    fireEvent(list, 'onEndReached');

    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledTimes(2);
      expect(getDailyRecordDetails).toHaveBeenCalledWith(expect.objectContaining({
        page: 2
      }));
    });
  });

  it('handles pull to refresh', async () => {
    const { getByTestId } = render(<AttendanceRecords />);
    await waitFor(() => expect(getDailyRecordDetails).toHaveBeenCalledTimes(1));

    const list = getByTestId('records-list');
    
    const { refreshControl } = list.props;
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledTimes(2);
      expect(getDailyRecordDetails).toHaveBeenLastCalledWith(expect.objectContaining({
        page: 1
      }));
    });
  });

  it('handles API error gracefully', async () => {
    (getDailyRecordDetails as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<AttendanceRecords />);

    await waitFor(() => {
      expect(logger.error).toHaveBeenCalledWith('Failed to fetch records:', expect.any(Error));
    });

    // Should still render UI without crash
    expect(screen.getByText('筛选')).toBeTruthy();
  });
});
