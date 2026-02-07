import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HistoryScreen from './HistoryScreen';
import { getDailyRecords } from '../../services/attendance';

// Mock services
jest.mock('../../services/attendance', () => ({
  getDailyRecords: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('HistoryScreen', () => {
  const mockRecords = [
    {
      id: 1,
      userId: 1,
      workDate: '2023-10-01',
      checkInTime: '2023-10-01T08:55:00.000Z',
      checkOutTime: '2023-10-01T18:05:00.000Z',
      status: 'normal',
    },
    {
      id: 2,
      userId: 1,
      workDate: '2023-10-02',
      checkInTime: '2023-10-02T09:10:00.000Z',
      checkOutTime: null,
      status: 'late',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-10-15T12:00:00.000Z'));
    (getDailyRecords as jest.Mock).mockResolvedValue({ items: mockRecords, total: 2 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly and loads data', async () => {
    const { getByText } = render(<HistoryScreen />);

    // Check header
    expect(getByText('2023年10月')).toBeTruthy();

    await waitFor(() => {
      // 2023-10-01 to 2023-10-31
      expect(getDailyRecords).toHaveBeenCalledWith({
        startDate: '2023-10-01',
        endDate: '2023-10-31',
      });
    });

    // Check items
    expect(getByText('2023-10-01 (ID: 1)')).toBeTruthy();
    expect(getByText('正常')).toBeTruthy();
    
    expect(getByText('2023-10-02 (ID: 2)')).toBeTruthy();
    expect(getByText('迟到')).toBeTruthy();
  });

  it('handles month navigation', async () => {
    const { getByText } = render(<HistoryScreen />);

    await waitFor(() => expect(getDailyRecords).toHaveBeenCalled());

    // Previous month
    fireEvent.press(getByText('<'));
    
    await waitFor(() => {
      expect(getByText('2023年9月')).toBeTruthy();
      expect(getDailyRecords).toHaveBeenCalledWith({
        startDate: '2023-09-01',
        endDate: '2023-09-30',
      });
    });

    // Next month (back to Oct)
    fireEvent.press(getByText('>'));
    
    await waitFor(() => {
      expect(getByText('2023年10月')).toBeTruthy();
    });
  });

  it('displays empty state when no records', async () => {
    (getDailyRecords as jest.Mock).mockResolvedValue({ items: [] });
    const { getByText } = render(<HistoryScreen />);

    await waitFor(() => {
      expect(getByText('本月无记录')).toBeTruthy();
    });
  });

  it('navigates to calendar view when calendar icon is pressed', async () => {
    const { getByTestId } = render(<HistoryScreen />);
    
    await waitFor(() => expect(getDailyRecords).toHaveBeenCalled());
    
    fireEvent.press(getByTestId('calendar-btn'));
    
    expect(mockNavigate).toHaveBeenCalledWith('AttendanceCalendar');
  });
});
