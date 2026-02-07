import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ScheduleCalendar } from './ScheduleCalendar';
import { renderWithProviders } from '@/test/utils';
import { attendanceService } from '@/services/attendance';

// Mock attendanceService
vi.mock('@/services/attendance', () => ({
  attendanceService: {
    getSchedules: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

const mockSchedules = [
  {
    id: 1,
    employeeId: 101,
    shiftId: 1,
    startDate: '2024-02-01',
    endDate: '2024-02-01',
    employeeName: '张三',
    shiftName: '早班',
  },
];

describe('ScheduleCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 设置当前时间为 2024-02-01，以便日历显示该月
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-02-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders schedules with employee names correctly', async () => {
    (attendanceService.getSchedules as any).mockResolvedValue(mockSchedules);

    renderWithProviders(<ScheduleCalendar deptId={1} />);

    // 等待加载并验证显示
    await waitFor(() => {
      // 检查是否显示了员工姓名和班次名称
      expect(screen.getByText(/张三: 早班/)).toBeInTheDocument();
    });
  });

  it('calls getSchedules with undefined deptId when deptId is -1', async () => {
    (attendanceService.getSchedules as any).mockResolvedValue([]);
    renderWithProviders(<ScheduleCalendar deptId={-1} />);
    
    await waitFor(() => {
        expect(attendanceService.getSchedules).toHaveBeenCalledWith(expect.objectContaining({
            deptId: undefined
        }));
    });
  });
});
