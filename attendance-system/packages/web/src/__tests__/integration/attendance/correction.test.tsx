import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CorrectionPage from '../../../pages/attendance/correction/CorrectionPage';
import { renderWithProviders } from '../../../test/utils';
import * as correctionService from '../../../services/correction';

// Mock services
vi.mock('@/services/correction', () => ({
  getDailyRecords: vi.fn(),
  supplementCheckIn: vi.fn(),
  supplementCheckOut: vi.fn(),
}));

// Mock DepartmentTree to avoid complex tree rendering
vi.mock('@/components/common/DepartmentTree', () => ({
  DepartmentTree: ({ onSelect }: { onSelect: (id: number) => void }) => (
    <div data-testid="department-tree">
      <button onClick={() => onSelect(1)}>Select Dept 1</button>
    </div>
  ),
}));

// Mock Antd components that are hard to test in JSDOM
// We need to mock Modal to ensure it renders its children immediately or in a way we can query
// But renderWithProviders usually handles Antd well enough for basic interactions if we don't need animation
// Let's spy on message to check feedback
const mockMessage = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    message: mockMessage,
    // Mock Table to simplify testing and avoid JSDOM rendering issues
    Table: ({ dataSource, columns }: any) => (
      <div data-testid="mock-table">
        {dataSource.map((record: any) => (
          <div key={record.id} className="mock-row">
            <span className="employee-name">{record.employeeName}</span>
            <div className="actions">
              {columns.find((col: any) => col.key === 'action')?.render(null, record)}
            </div>
          </div>
        ))}
      </div>
    ),
  };
});

describe('CorrectionPage Integration', () => {
  const mockRecords = [
    {
      id: '1',
      employeeId: 101, // Changed to number
      employeeName: 'John Doe',
      deptName: 'Engineering',
      workDate: '2024-03-20',
      checkInTime: undefined, // Missing check-in
      checkOutTime: '2024-03-20 18:00:00',
      status: 'absent',
    },
    {
      id: '2',
      employeeId: 102,
      employeeName: 'Jane Smith',
      deptName: 'Marketing',
      workDate: '2024-03-20',
      checkInTime: '2024-03-20 09:00:00',
      checkOutTime: undefined, // Missing check-out
      status: 'late',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    vi.mocked(correctionService.getDailyRecords).mockResolvedValue({
      items: mockRecords as any,
      total: 2,
      totalPages: 1,
      page: 1,
      pageSize: 10,
    });

    vi.mocked(correctionService.supplementCheckIn).mockResolvedValue({
      // id: 1,
      // message: 'Success', // Removed extra property
    } as any);

    vi.mocked(correctionService.supplementCheckOut).mockResolvedValue({
      // id: 2,
      // message: 'Success',
    } as any);
  });

  it('should render daily records and allow check-in correction', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CorrectionPage />);

    // 1. Verify initial data load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check if table renders records
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // 2. Perform Check-In Correction for John Doe (Record 1)
    // Find "补签到" button for John Doe
    const row1 = screen.getByText('John Doe').closest('.mock-row');
    expect(row1).not.toBeNull();
    const checkInBtn = within(row1 as HTMLElement).getByText('补签到');
    await user.click(checkInBtn);

    // 3. Verify Dialog opens
    expect(await screen.findByText('补签到', { selector: '.ant-modal-title' })).toBeInTheDocument();
    expect(screen.getByText(/员工: John Doe/)).toBeInTheDocument();

    // 4. Fill Form
    // Antd DatePicker is tricky. In the dialog it defaults to current time.
    // We can just type in the input if it's accessible, or just click OK since it has default value.
    // The dialog code: form.setFieldsValue({ checkInTime: dayjs() })
    // So we just need to type remark.
    const remarkInput = screen.getByPlaceholderText('请输入补签原因...');
    await user.type(remarkInput, 'Forgot card');

    // 5. Submit
    // Antd Modal OK button might be "OK" (default) or "确定" (if configured)
    const submitBtn = screen.getByRole('button', { name: /OK|确\s*定/i });
    await user.click(submitBtn);

    // 6. Verify Service Call
    await waitFor(() => {
      expect(correctionService.supplementCheckIn).toHaveBeenCalledWith(expect.objectContaining({
        dailyRecordId: '1',
        remark: 'Forgot card',
        // checkInTime will be ISO string of current time (mocked or real)
      }));
    });

    // 7. Verify Success Message
    expect(mockMessage.success).toHaveBeenCalledWith('补签到成功');
    
    // 8. Verify Reload
    expect(correctionService.getDailyRecords).toHaveBeenCalledTimes(2); // Initial + Reload
  });

  it('should allow check-out correction', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CorrectionPage />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Perform Check-Out Correction for Jane Smith (Record 2)
    const row2 = screen.getByText('Jane Smith').closest('.mock-row');
    expect(row2).not.toBeNull();
    const checkOutBtn = within(row2 as HTMLElement).getByText('补签退');
    await user.click(checkOutBtn);

    // Verify Dialog
    expect(await screen.findByText('补签退', { selector: '.ant-modal-title' })).toBeInTheDocument();
    expect(screen.getByText(/员工: Jane Smith/)).toBeInTheDocument();

    // Fill Form
    const remarkInput = screen.getByPlaceholderText('请输入补签原因...');
    await user.type(remarkInput, 'System error');

    // Submit
    const submitBtn = screen.getByRole('button', { name: /OK|确\s*定/i });
    await user.click(submitBtn);

    // Verify Service Call
    await waitFor(() => {
      expect(correctionService.supplementCheckOut).toHaveBeenCalledWith(expect.objectContaining({
        dailyRecordId: '2',
        remark: 'System error',
      }));
    });

    expect(mockMessage.success).toHaveBeenCalledWith('补签退成功');
    expect(correctionService.getDailyRecords).toHaveBeenCalledTimes(2);
  });
});
