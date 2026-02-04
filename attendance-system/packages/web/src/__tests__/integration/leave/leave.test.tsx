import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeavePage from '../../../pages/attendance/leave/LeavePage';
import { renderWithProviders } from '../../../test/utils';
import * as leaveService from '../../../services/leave';
import { LeaveType, LeaveStatus } from '@attendance/shared';

// Mock Services
vi.mock('../../../services/leave', () => ({
  getLeaves: vi.fn(),
  createLeave: vi.fn(),
  cancelLeave: vi.fn(),
}));

// Mock Antd Components
vi.mock('antd', async () => {
  const antd = await vi.importActual('antd');
  const DatePickerMock = ({ onChange, value, ...props }: any) => (
      <input
        type="date"
        data-testid="mock-datepicker"
        onChange={(e) => {
           const val = e.target.value;
           onChange({ format: () => val, isValid: () => true, toISOString: () => val });
        }}
        value={value ? value.format('YYYY-MM-DD') : ''}
        {...props}
      />
  );
  
  (DatePickerMock as any).RangePicker = ({ onChange, ...props }: any) => (
       <input 
         data-testid="mock-rangepicker"
         onChange={(e) => {
            const val = e.target.value;
            const parts = val.split(',');
            if (parts.length === 2) {
                onChange([
                    { toISOString: () => parts[0], format: () => parts[0], isValid: () => true }, 
                    { toISOString: () => parts[1], format: () => parts[1], isValid: () => true }
                ]);
            }
         }}
         {...props}
       />
  );

  return {
    ...antd,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
    Table: ({ dataSource, columns, rowKey }: any) => (
      <div data-testid="mock-table">
        {dataSource.map((record: any) => (
          <div key={record[rowKey] || record.id} data-testid={`row-${record.id}`} className="mock-row">
            {columns.map((col: any) => (
              <div key={col.key || col.dataIndex}>
                {col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex]}
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
    Modal: Object.assign(
      ({ children, open, onOk, onCancel, title }: any) => {
        if (!open) return null;
        return (
          <div role="dialog" aria-label={title}>
            <h2>{title}</h2>
            {children}
            <div className="ant-modal-footer">
               <button onClick={onCancel}>Cancel</button>
               <button onClick={onOk}>OK</button>
            </div>
          </div>
        );
      },
      {
        confirm: vi.fn(({ onOk }) => onOk()),
      }
    ),
    Select: Object.assign(
      ({ onChange, value, children, options, placeholder, showSearch, filterOption, onSearch, loading, allowClear, ...props }: any) => (
        <select
          data-testid="mock-select"
          value={value || ''}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val);
          }}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options
            ? options.map((opt: any) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      ),
      {
        Option: ({ value, children }: any) => <option value={value}>{children}</option>,
      }
    ),
    DatePicker: DatePickerMock,
  };
});

// Mock Data
const mockLeaves = [
  {
    id: 1,
    employeeId: 101,
    type: LeaveType.annual,
    startTime: '2023-05-01T09:00:00Z',
    endTime: '2023-05-02T18:00:00Z',
    duration: 16,
    reason: 'Vacation',
    status: LeaveStatus.approved,
    createdAt: '2023-04-20T10:00:00Z',
  },
  {
    id: 2,
    employeeId: 102,
    type: LeaveType.sick,
    startTime: '2023-05-10T09:00:00Z',
    endTime: '2023-05-10T18:00:00Z',
    duration: 8,
    reason: 'Sick leave',
    status: LeaveStatus.pending,
    createdAt: '2023-05-09T08:00:00Z',
  },
];

describe('Leave Integration Test', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (leaveService.getLeaves as any).mockResolvedValue({
      items: mockLeaves,
      total: 2,
      page: 1,
      pageSize: 10,
    });
  });

  it('renders leave list correctly', async () => {
    renderWithProviders(<LeavePage />);
    
    await waitFor(() => {
      const table = screen.getByTestId('mock-table');
      expect(within(table).getByText('101')).toBeInTheDocument(); 
      expect(within(table).getByText('年假')).toBeInTheDocument();
      expect(within(table).getByText('病假')).toBeInTheDocument();
    });
  });

  it('creates a new leave request', async () => {
    (leaveService.createLeave as any).mockResolvedValue({
      id: 3,
      employeeId: 103,
      type: LeaveType.personal,
    });

    renderWithProviders(<LeavePage />);
    
    // Open Modal
    const createButton = screen.getByRole('button', { name: /申请请假/i });
    fireEvent.click(createButton);

    await waitFor(() => expect(screen.getByRole('dialog', { name: /申请请假/i })).toBeInTheDocument());

    const dialog = screen.getByRole('dialog', { name: /申请请假/i });

    // Fill Form
    // Employee ID
    fireEvent.change(screen.getByPlaceholderText('请输入员工ID'), { target: { value: '103' } });
    
    // Type (Select)
    const select = within(dialog).getByTestId('mock-select');
    fireEvent.change(select, { target: { value: LeaveType.personal } });

    // Time Range
    const rangePicker = within(dialog).getByTestId('mock-rangepicker');
    fireEvent.change(rangePicker, { 
        target: { value: '2023-06-01T09:00:00.000Z,2023-06-03T18:00:00.000Z' } 
    });

    // Reason
    fireEvent.change(screen.getByPlaceholderText('请输入请假/出差事由'), { target: { value: 'Personal matters' } });

    // Submit
    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(leaveService.createLeave).toHaveBeenCalledWith(expect.objectContaining({
        employeeId: 103,
        type: LeaveType.personal,
        startTime: '2023-06-01T09:00:00.000Z',
        endTime: '2023-06-03T18:00:00.000Z',
        reason: 'Personal matters',
      }));
    });
  });

  it('cancels a leave request', async () => {
    (leaveService.cancelLeave as any).mockResolvedValue({});

    renderWithProviders(<LeavePage />);
    
    await waitFor(() => {
      const table = screen.getByTestId('mock-table');
      expect(within(table).getByText('病假')).toBeInTheDocument();
    });

    // Find row for Sick leave (id 2)
    const row = screen.getByTestId('row-2');
    
    // Find Cancel button.
    const cancelButton = within(row).getByText('撤销');
    fireEvent.click(cancelButton);

    // Confirm dialog mocked to auto-confirm
    await waitFor(() => {
      expect(leaveService.cancelLeave).toHaveBeenCalledWith(2);
    });
  });

  it('validates form inputs before submission', async () => {
    renderWithProviders(<LeavePage />);
    
    // Open Modal
    const createButton = screen.getByRole('button', { name: /申请请假/i });
    fireEvent.click(createButton);
    
    await waitFor(() => expect(screen.getByRole('dialog', { name: /申请请假/i })).toBeInTheDocument());

    // Submit without filling
    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);
    
    // Expect createLeave NOT to be called
    expect(leaveService.createLeave).not.toHaveBeenCalled();
    
    // Expect validation error
    await waitFor(() => {
        expect(screen.getByText('请输入员工ID')).toBeInTheDocument();
    });
  });

  it('prevents editing cancelled leaves', async () => {
    (leaveService.getLeaves as any).mockResolvedValue({
      items: [{
          id: 999,
          employeeId: 999,
          type: LeaveType.annual,
          startTime: '2023-05-01T09:00:00Z',
          endTime: '2023-05-02T18:00:00Z',
          duration: 16,
          reason: 'Vacation',
          status: LeaveStatus.cancelled,
          createdAt: '2023-04-20T10:00:00Z',
      }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
    const { message } = await import('antd');

    renderWithProviders(<LeavePage />);
    
    await waitFor(() => screen.getByText('999'));

    const editButton = screen.getByText('编辑');
    fireEvent.click(editButton);

    expect(message.warning).toHaveBeenCalledWith('已撤销记录不可编辑');
    expect(screen.queryByRole('dialog', { name: /编辑/i })).not.toBeInTheDocument();
  });

  it('filters leaves by employeeId and type', async () => {
    renderWithProviders(<LeavePage />);
    
    const idInput = screen.getByPlaceholderText('员工ID');
    fireEvent.change(idInput, { target: { value: '101' } });
    
    await waitFor(() => {
       expect(leaveService.getLeaves).toHaveBeenCalledWith(expect.objectContaining({
         employeeId: 101,
       }));
    });

    const typeSelect = screen.getByTestId('mock-select');
    fireEvent.change(typeSelect, { target: { value: LeaveType.sick } });
    
    await waitFor(() => {
       expect(leaveService.getLeaves).toHaveBeenCalledWith(expect.objectContaining({
         employeeId: 101,
         type: LeaveType.sick
       }));
    });
  });

  it('handles API error gracefully', async () => {
    (leaveService.getLeaves as any).mockRejectedValue(new Error('API Error'));
    const { message } = await import('antd');
    
    renderWithProviders(<LeavePage />);
    
    await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('加载请假列表失败');
    });
  });
});
