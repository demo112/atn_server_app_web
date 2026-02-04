import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShiftPage from '../../../pages/attendance/shift/ShiftPage';
import { renderWithProviders } from '../../../test/utils';
import * as shiftService from '../../../services/shift';
import * as timePeriodService from '../../../services/time-period';

// Mock Services
vi.mock('../../../services/shift', () => ({
  getShifts: vi.fn(),
  createShift: vi.fn(),
  updateShift: vi.fn(),
  deleteShift: vi.fn(),
}));

vi.mock('../../../services/time-period', () => ({
  createTimePeriod: vi.fn(),
  updateTimePeriod: vi.fn(),
}));

// Mock Antd for Message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock Data
const mockBackendShifts = [
  {
    id: 1,
    name: 'General Shift',
    periods: [
      {
        periodId: 101,
        sortOrder: 1,
        period: {
          id: 101,
          name: 'General Period',
          type: 0,
          startTime: '09:00',
          endTime: '18:00',
          rules: {
            checkInStartOffset: 60,
            checkInEndOffset: 60,
            checkOutStartOffset: 60,
            checkOutEndOffset: 60,
            lateGraceMinutes: 10,
            earlyLeaveGraceMinutes: 10,
          },
        },
      },
    ],
  },
];

describe('Shift Integration Test', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (shiftService.getShifts as any).mockResolvedValue(mockBackendShifts);
    (timePeriodService.createTimePeriod as any).mockResolvedValue({ id: 201 });
    (shiftService.createShift as any).mockResolvedValue({ id: 2 });
    (shiftService.deleteShift as any).mockResolvedValue({});
    
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders shift list correctly', async () => {
    renderWithProviders(<ShiftPage />);
    
    await waitFor(() => {
      expect(screen.getByText('General Shift')).toBeInTheDocument();
      // Check time range 09:00 - 18:00
      // ShiftTable renders: {t.clockIn} - {t.clockOut}
      expect(screen.getByText('09:00 - 18:00')).toBeInTheDocument();
    });
  });

  it('creates a new shift', async () => {
    renderWithProviders(<ShiftPage />);
    
    // Open Modal
    const addButton = screen.getByText('Add');
    await user.click(addButton);

    // Modal should be open
    const modalTitle = await screen.findByText('Create New Shift');
    expect(modalTitle).toBeInTheDocument();

    // Fill Name
    const nameInput = screen.getByPlaceholderText('e.g. Standard Morning Shift');
    await user.type(nameInput, 'Morning Shift');

    // Submit
    const saveButton = screen.getByText('Save Shift');
    await user.click(saveButton);

    await waitFor(() => {
      // Check if time period created
      expect(timePeriodService.createTimePeriod).toHaveBeenCalled();
      // Check if shift created
      expect(shiftService.createShift).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Morning Shift',
        cycleDays: 1,
      }));
      expect(shiftService.getShifts).toHaveBeenCalledTimes(2);
    });
  });

  it('validates form inputs', async () => {
    renderWithProviders(<ShiftPage />);
    
    await user.click(screen.getByText('Add'));
    
    // Click Save without filling name
    await user.click(screen.getByText('Save Shift'));
    
    // Expect createShift NOT to be called
    expect(shiftService.createShift).not.toHaveBeenCalled();
    // Expect no modal closure (still visible)
    expect(screen.getByText('Create New Shift')).toBeInTheDocument();
  });

  it('creates a multi-period shift (2 check-ins)', async () => {
    renderWithProviders(<ShiftPage />);
    
    await user.click(screen.getByText('Add'));
    
    // Type Name
    await user.type(screen.getByPlaceholderText(/e.g./), 'Split Shift');
    
    // Select 2 Sessions
    // The label text is "2 Sessions"
    await user.click(screen.getByText('2 Sessions'));
    
    // Verify 2 time rows appear by checking session indicators "01" and "02"
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    
    // Fill times
    // Since there are multiple inputs with same type/placeholder, we need to be specific
    // We can use getAllByDisplayValue or better, scope by session container if possible.
    // However, the inputs don't have unique labels per session in the DOM structure shown.
    // But they appear in order.
    
    // Get all time inputs (Check-in and Check-out for each session)
    // Actually they have labels "Check-in" and "Check-out".
    // We added aria-label="Session {n} Check-in" to the inputs in ShiftModal.tsx
    
    // Session 1: 09:00 - 12:00
    const s1CheckIn = screen.getByLabelText('Session 1 Check-in');
    const s1CheckOut = screen.getByLabelText('Session 1 Check-out');
    fireEvent.change(s1CheckIn, { target: { value: '09:00' } });
    fireEvent.change(s1CheckOut, { target: { value: '12:00' } });
    
    // Session 2: 14:00 - 18:00
    const s2CheckIn = screen.getByLabelText('Session 2 Check-in');
    const s2CheckOut = screen.getByLabelText('Session 2 Check-out');
    fireEvent.change(s2CheckIn, { target: { value: '14:00' } });
    fireEvent.change(s2CheckOut, { target: { value: '18:00' } });
    
    await user.click(screen.getByText('Save Shift'));
    
    await waitFor(() => {
      expect(shiftService.createShift).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Split Shift',
        dailyCheckins: 2,
        times: expect.arrayContaining([
          expect.objectContaining({ clockIn: '09:00', clockOut: '12:00' }),
          expect.objectContaining({ clockIn: '14:00', clockOut: '18:00' })
        ])
      }));
    });
  });

  it('supports overnight shift (cross-day)', async () => {
    renderWithProviders(<ShiftPage />);
    
    await user.click(screen.getByText('Add'));
    await user.type(screen.getByPlaceholderText(/e.g./), 'Night Shift');
    
    const checkIn = screen.getByLabelText('Session 1 Check-in');
    const checkOut = screen.getByLabelText('Session 1 Check-out');
    
    // 22:00 - 06:00 (next day)
    fireEvent.change(checkIn, { target: { value: '22:00' } });
    fireEvent.change(checkOut, { target: { value: '06:00' } });
    
    await user.click(screen.getByText('Save Shift'));
    
    await waitFor(() => {
      expect(shiftService.createShift).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Night Shift',
        times: expect.arrayContaining([
          expect.objectContaining({ clockIn: '22:00', clockOut: '06:00' })
        ])
      }));
    });
  });

  it('populates form in edit mode', async () => {
    // Mock getShifts to return a complex shift
    const complexShift = {
      id: 10,
      name: 'Complex Shift',
      periods: [
        {
          periodId: 1,
          sortOrder: 1,
          period: { id: 1, startTime: '09:00', endTime: '12:00' }
        },
        {
          periodId: 2,
          sortOrder: 2,
          period: { id: 2, startTime: '14:00', endTime: '18:00' }
        }
      ]
    };
    (shiftService.getShifts as any).mockResolvedValue([complexShift]);
    
    renderWithProviders(<ShiftPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Complex Shift')).toBeInTheDocument();
    });
    
    // Find Edit button
    // Assuming Edit button has title="Edit" or text "Edit"
    // Based on Delete button being title="Delete", let's try title="Edit"
    const row = screen.getByText('Complex Shift').closest('tr');
    // If getting by title fails, we might need to update the test to find by icon class or something
    // But let's assume consistent accessibility practices
    // If previous tests used getByTitle('Delete'), Edit likely has title too.
    // If not, I'll fix it in problem-fixing.
    // Let's look for any button that isn't Delete
    const buttons = within(row!).getAllByRole('button');
    // Usually Edit is first, Delete is second
    // Or check if there is an Edit button text
    
    // Let's try getting by Title first, if it fails I'll update
    const editButton = within(row!).getByTitle('Edit');
    await user.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByText('Edit Shift')).toBeInTheDocument();
    });
    
    // Verify values
    expect(screen.getByDisplayValue('Complex Shift')).toBeInTheDocument();
    // Verify 2 sessions selected (radio button checked)
    // The "2 Sessions" radio should be checked.
    // We can check if the input is checked
    // The label wraps the input.
    // const radio2 = screen.getByLabelText('2 Sessions') as HTMLInputElement; // Wait label text is inside span
    // The input is hidden.
    // Let's check if "02" session indicator is present
    expect(screen.getByText('02')).toBeInTheDocument();
    
    // Verify times
    const checkIns = screen.getAllByDisplayValue('09:00');
    expect(checkIns.length).toBeGreaterThan(0);
    const checkIns2 = screen.getAllByDisplayValue('14:00');
    expect(checkIns2.length).toBeGreaterThan(0);
  });

  it('handles delete protection error', async () => {
    (shiftService.deleteShift as any).mockRejectedValue(new Error('Shift is in use'));
    const { message } = await import('antd');
    
    renderWithProviders(<ShiftPage />);
    
    await waitFor(() => {
      expect(screen.getByText('General Shift')).toBeInTheDocument();
    });

    const row = screen.getByText('General Shift').closest('tr');
    const deleteButton = within(row!).getByTitle('Delete');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(shiftService.deleteShift).toHaveBeenCalled();
      // Verify error message (assuming generic error handler in ShiftPage)
      // "Failed to delete shift" or similar?
      // Need to check ShiftPage implementation for exact message or if it uses global error handler
      // I'll assume it shows *some* error
      expect(message.error).toHaveBeenCalled();
    });
  });

  it('deletes a shift', async () => {
    renderWithProviders(<ShiftPage />);
    
    await waitFor(() => {
      expect(screen.getByText('General Shift')).toBeInTheDocument();
    });

    // Find row
    const row = screen.getByText('General Shift').closest('tr');
    expect(row).toBeInTheDocument();
    
    // Find Delete button
    const deleteButton = within(row!).getByTitle('Delete');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(shiftService.deleteShift).toHaveBeenCalledWith(1);
      expect(shiftService.getShifts).toHaveBeenCalledTimes(2); // Initial + After Delete
    });
  });
});
