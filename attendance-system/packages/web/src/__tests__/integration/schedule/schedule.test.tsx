import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SchedulePage from '@/pages/attendance/schedule/SchedulePage';
import { renderWithProviders } from '@/test/utils';
import { attendanceService } from '@/services/attendance';
import { employeeService } from '@/services/employee';

// Mock Services
vi.mock('@/services/attendance', () => ({
  attendanceService: {
    getSchedules: vi.fn(),
    createSchedule: vi.fn(),
    batchCreateSchedule: vi.fn(),
    deleteSchedule: vi.fn(),
    getShifts: vi.fn(),
  },
}));

vi.mock('@/services/employee', () => ({
  employeeService: {
    getEmployees: vi.fn(),
  },
}));

// Mock Child Components
vi.mock('@/components/common/DepartmentTree', () => ({
  DepartmentTree: ({ onSelect }: any) => (
    <div data-testid="mock-dept-tree">
      <button onClick={() => onSelect(1)}>Select Dept 1</button>
    </div>
  ),
}));

vi.mock('@/pages/attendance/schedule/components/ScheduleCalendar', () => ({
  ScheduleCalendar: ({ deptId }: any) => (
    <div data-testid="mock-calendar">Calendar for Dept {deptId}</div>
  ),
}));

// Mock Data
const mockShifts = [
  { id: 1, name: 'Morning Shift' },
  { id: 2, name: 'Night Shift' },
];

const mockEmployees = [
  { id: 101, name: 'John Doe', employeeNo: 'E001' },
  { id: 102, name: 'Jane Smith', employeeNo: 'E002' },
];

describe('Schedule Integration Test', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (attendanceService.getShifts as any).mockResolvedValue(mockShifts);
    (employeeService.getEmployees as any).mockResolvedValue({ items: mockEmployees });
    (attendanceService.createSchedule as any).mockResolvedValue({ id: 1 });
  });

  it('renders schedule page correctly', async () => {
    renderWithProviders(<SchedulePage />);
    
    expect(screen.getByText('排班管理')).toBeInTheDocument();
    expect(screen.getByTestId('mock-dept-tree')).toBeInTheDocument();
    
    // Initially no calendar (prompt to select)
    expect(screen.getByText('请选择左侧部门查看排班')).toBeInTheDocument();
  });

  it('selects department and shows calendar', async () => {
    renderWithProviders(<SchedulePage />);
    
    // Select Dept
    fireEvent.click(screen.getByText('Select Dept 1'));
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-calendar')).toBeInTheDocument();
      expect(screen.getByText('Calendar for Dept 1')).toBeInTheDocument();
    });
  });

  it('creates a new schedule', async () => {
    renderWithProviders(<SchedulePage />);
    
    // Open Dialog
    const createButton = screen.getByText('+ 新建排班');
    await user.click(createButton);

    // Dialog uses native elements
    await waitFor(() => expect(screen.getByText('新建排班')).toBeInTheDocument());

    // Select Employee
    // Label: 选择员工:
    // Select is next to label or inside label's container?
    // Structure: <label>选择员工:</label><select>...
    // I can find by role 'combobox' but there might be multiple (Shift select).
    // Let's find by label text if possible, or just by order.
    // Employee is first, Shift is second.
    
    const selects = screen.getAllByRole('combobox');
    const empSelect = selects[0];
    const shiftSelect = selects[1];
    
    await user.selectOptions(empSelect, '101'); // John Doe
    await user.selectOptions(shiftSelect, '1'); // Morning Shift

    // Dates
    // We can use getByLabelText if we add id to inputs or check structure.
    // Or simpler: use getAllByDisplayValue('') if empty? No.
    // Use container + queryselector logic or getAllByRole('textbox')? No, date inputs are not textboxes.
    // getAllByPlaceholderText? No placeholder.
    // But they are `input type="date"`.
    // testing-library doesn't have `getByType`.
    // We can use `container.querySelectorAll('input[type="date"]')`.
    
    // Actually, simple way:
    // Labels "开始日期:" and "结束日期:" are present.
    // But inputs are siblings.
    // We can use closest div or simple `screen.getAllByRole` doesn't work for date?
    // In jsdom/testing-library, `input type="date"` usually has role `presentation` or implicit?
    // It is often hard to select by role.
    // Let's use `fireEvent.change` on inputs found by other means.
    
    // We can find by Label text then traverse.
    // But labels are not associated (no htmlFor).
    
    // Let's try `screen.getAllByDisplayValue('')`? No.
    
    // Let's use `document.querySelectorAll`.
    const dateInputs = document.querySelectorAll('input[type="date"]');
    if (dateInputs.length >= 2) {
        fireEvent.change(dateInputs[0], { target: { value: '2023-07-01' } });
        fireEvent.change(dateInputs[1], { target: { value: '2023-07-05' } });
    }

    // Submit
    const submitButton = screen.getByText('提交');
    await user.click(submitButton);

    await waitFor(() => {
      expect(attendanceService.createSchedule).toHaveBeenCalledWith(expect.objectContaining({
        employeeId: 101,
        shiftId: 1,
        startDate: '2023-07-01',
        endDate: '2023-07-05',
      }));
    });
  });
});
