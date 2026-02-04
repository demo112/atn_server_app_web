import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ScheduleScreen from './ScheduleScreen';
import { authService } from '../../services/auth';
import { getSchedules } from '../../services/attendance';
import { getUser, setUser } from '../../utils/auth';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../../services/auth', () => ({
  authService: {
    getUser: jest.fn(),
    getMe: jest.fn(),
  },
}));

jest.mock('../../utils/auth', () => ({
  getUser: jest.fn(),
  setUser: jest.fn(),
}));

jest.mock('../../services/attendance', () => ({
  getSchedules: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      setOptions: jest.fn(),
      navigate: jest.fn(),
    }),
    useFocusEffect: jest.fn((callback) => {
      React.useEffect(callback, []);
    }),
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ScheduleScreen', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    employeeId: 101,
  };

  const mockSchedules = [
    {
      id: 1,
      employeeId: 101,
      shiftId: 1,
      shift: { id: 1, name: 'Morning', startTime: '09:00', endTime: '18:00' },
      startDate: '2023-10-01',
      endDate: '2023-10-05',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (authService.getUser as jest.Mock).mockResolvedValue(mockUser);
    (authService.getMe as jest.Mock).mockResolvedValue(mockUser);
    (getUser as jest.Mock).mockResolvedValue(mockUser);
    (getSchedules as jest.Mock).mockResolvedValue(mockSchedules);
    
    // Mock Date to ensure consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-10-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly and loads schedules', async () => {
    const { getByText, getAllByText } = render(<ScheduleScreen />);

    // Check month display
    expect(getByText('2023年10月')).toBeTruthy();

    await waitFor(() => {
      expect(getUser).toHaveBeenCalled();
      expect(authService.getMe).toHaveBeenCalled();
      expect(getSchedules).toHaveBeenCalledWith({
        employeeId: 101,
        startDate: '2023-10-01',
        endDate: '2023-10-31',
      });
    });

    // Check if schedule items are rendered
    // Note: The component expands the range 2023-10-01 to 2023-10-05
    await waitFor(() => {
        expect(getByText('2023-10-01')).toBeTruthy();
        // Check for shift name and time separately as they are in different Text components
        expect(getAllByText('Morning').length).toBeGreaterThan(0);
        expect(getAllByText('09:00 - 18:00').length).toBeGreaterThan(0);
    });
  });

  it('handles month navigation', async () => {
    const { getByText } = render(<ScheduleScreen />);

    await waitFor(() => expect(getSchedules).toHaveBeenCalled());

    // Switch to previous month
    fireEvent.press(getByText('<'));

    await waitFor(() => {
      expect(getByText('2023年9月')).toBeTruthy();
      expect(getSchedules).toHaveBeenCalledWith({
        employeeId: 101,
        startDate: '2023-09-01',
        endDate: '2023-09-30',
      });
    });
  });

  it('handles empty schedules', async () => {
    (getSchedules as jest.Mock).mockResolvedValue([]);
    const { getAllByText, queryByText } = render(<ScheduleScreen />);

    await waitFor(() => expect(getSchedules).toHaveBeenCalled());

    // Should not show any shifts
    expect(queryByText('Morning')).toBeNull();
    // Should show "Rest" for all days
    // Depending on window size, it might not render all 31 days immediately, but at least some.
    expect(getAllByText('休息').length).toBeGreaterThan(0);
  });

  it('handles error fetching schedules', async () => {
    const error = new Error('Network error');
    (getSchedules as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(require('../../utils/logger').logger, 'error').mockImplementation();

    render(<ScheduleScreen />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });
    
    consoleSpy.mockRestore();
  });
});
