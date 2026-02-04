import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AttendanceRecords from './AttendanceRecords';
import { getDailyRecordDetails } from '../../services/statistics';
import { useAuth } from '../../utils/auth';

// Mock dependencies
jest.mock('../../services/statistics');
jest.mock('../../utils/auth');
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock React Native Paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    ...RealModule,
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Portal: ({ children }: { children: React.ReactNode }) => <View>{children}</View>, // Render directly
    Modal: ({ visible, children, onDismiss }: any) => visible ? <View testID="mock-modal">{children}</View> : null,
  };
});

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  return jest.fn();
});

const mockRecords = [
  {
    id: '1',
    employeeName: 'Naruto',
    employeeNo: '1001',
    deptName: 'Ninja Ops',
    workDate: '2023-10-01',
    shiftName: 'Day Shift',
    checkInTime: '2023-10-01T09:00:00Z',
    checkOutTime: '2023-10-01T18:00:00Z',
    status: 'normal',
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
  },
  {
    id: '2',
    employeeName: 'Sasuke',
    employeeNo: '1002',
    deptName: 'Police Force',
    workDate: '2023-10-01',
    shiftName: 'Night Shift',
    checkInTime: '2023-10-01T20:00:00Z',
    checkOutTime: null,
    status: 'late',
    lateMinutes: 15,
    earlyLeaveMinutes: 0,
  },
];

describe('AttendanceRecords Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1', name: 'Test User' } });
    (getDailyRecordDetails as jest.Mock).mockResolvedValue({
      items: mockRecords,
      total: 2,
      page: 1,
      totalPages: 1,
    });
  });

  it('renders correctly and fetches initial data', async () => {
    const { getByText, getByPlaceholderText } = render(<AttendanceRecords />);

    expect(getByPlaceholderText('搜索姓名')).toBeTruthy();
    expect(getByText('筛选')).toBeTruthy();

    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledTimes(1);
      expect(getByText('Naruto (1001)')).toBeTruthy();
      expect(getByText('Sasuke (1002)')).toBeTruthy();
    });
  });

  it('handles search', async () => {
    const { getByPlaceholderText } = render(<AttendanceRecords />);
    const searchInput = getByPlaceholderText('搜索姓名');

    await waitFor(() => expect(getDailyRecordDetails).toHaveBeenCalled());

    fireEvent.changeText(searchInput, 'Sasuke');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledTimes(2);
      expect(getDailyRecordDetails).toHaveBeenLastCalledWith(expect.objectContaining({
        employeeName: 'Sasuke',
        page: 1,
      }));
    });
  });

  it('handles filter modal and status selection', async () => {
    const { getByText, getByTestId } = render(<AttendanceRecords />);

    await waitFor(() => expect(getDailyRecordDetails).toHaveBeenCalled());

    // Open filter modal
    fireEvent.press(getByText('筛选'));
    
    // Check if modal is visible
    expect(getByTestId('mock-modal')).toBeTruthy();

    // Select '迟到' status
    fireEvent.press(getByTestId('filter-chip-late'));
    
    // Confirm
    fireEvent.press(getByTestId('filter-confirm-btn'));

    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledTimes(2); // Initial + Filter
      expect(getDailyRecordDetails).toHaveBeenLastCalledWith(expect.objectContaining({
        status: 'late',
        page: 1,
      }));
    });
  });

  it('handles pull to refresh', async () => {
    const { getByTestId } = render(<AttendanceRecords />);
    
    await waitFor(() => expect(getDailyRecordDetails).toHaveBeenCalled());
    
    const flatList = getByTestId('records-list');
    
    // Trigger refresh
    const { refreshControl } = flatList.props;
    await act(async () => {
      refreshControl.props.onRefresh();
    });
    
    expect(getDailyRecordDetails).toHaveBeenCalledTimes(2);
  });

  it('handles pagination', async () => {
     (getDailyRecordDetails as jest.Mock).mockResolvedValueOnce({
      items: mockRecords,
      total: 20,
      page: 1,
      totalPages: 2,
    }).mockResolvedValueOnce({
      items: [{ ...mockRecords[0], id: '3', employeeName: 'Sakura', employeeNo: '1003' }],
      total: 20,
      page: 2,
      totalPages: 2,
    });

    const { getByText, getByTestId } = render(<AttendanceRecords />);
    
    await waitFor(() => expect(getByText('Naruto (1001)')).toBeTruthy());

    // Trigger onEndReached
    const flatList = getByTestId('records-list');
    fireEvent(flatList, 'onEndReached');
    
    await waitFor(() => {
      expect(getDailyRecordDetails).toHaveBeenCalledTimes(2);
      expect(getDailyRecordDetails).toHaveBeenLastCalledWith(expect.objectContaining({
        page: 2
      }));
    });
  });
});
