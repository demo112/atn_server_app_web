import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmployeeList from '../../../pages/employee/EmployeeList';
import { renderWithProviders } from '../../../test/utils';
import { employeeService } from '../../../services/employee';
import { userService } from '../../../services/user';

// Mock Services
vi.mock('../../../services/employee', () => ({
  employeeService: {
    getEmployees: vi.fn(),
    createEmployee: vi.fn(),
    updateEmployee: vi.fn(),
    deleteEmployee: vi.fn(),
    bindUser: vi.fn(),
  },
}));

vi.mock('../../../services/user', () => ({
  userService: {
    getUsers: vi.fn(),
  },
}));

// Mock Antd Components
vi.mock('antd', async () => {
  const antd = await vi.importActual('antd');
  return {
    ...antd,
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
            const numVal = Number(val);
            onChange(isNaN(numVal) ? val : numVal);
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
    DatePicker: ({ onChange, value, ...props }: any) => (
      <input
        type="date"
        data-testid="mock-datepicker"
        onChange={(e) => {
           const val = e.target.value;
           // Mock dayjs object with format method
           onChange({ format: () => val, isValid: () => true });
        }}
        value={value ? value.format('YYYY-MM-DD') : ''}
        {...props}
      />
    ),
  };
});

// Mock Data
const mockEmployees = [
  {
    id: 1,
    employeeNo: 'E001',
    name: 'John Doe',
    deptId: 3,
    departmentName: 'Backend Team',
    deptName: 'Backend Team',
    phone: '1234567890',
    email: 'john@example.com',
    hireDate: '2023-01-01',
    userId: null,
    username: null,
  },
  {
    id: 2,
    employeeNo: 'E002',
    name: 'Jane Smith',
    deptId: 4,
    departmentName: 'Frontend Team',
    deptName: 'Frontend Team',
    phone: '0987654321',
    email: 'jane@example.com',
    hireDate: '2023-02-01',
    userId: 101,
    username: 'janesmith',
  },
];

const mockUsers = [
  { id: 201, username: 'newuser', employeeName: null },
  { id: 202, username: 'otheruser', employeeName: null },
];

describe('Employee Integration Test', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (employeeService.getEmployees as any).mockResolvedValue({
      items: mockEmployees,
      total: 2,
      page: 1,
      pageSize: 10,
    });
    (userService.getUsers as any).mockResolvedValue({
      items: mockUsers,
      total: 2,
    });
  });

  it('renders employee list correctly', async () => {
    renderWithProviders(<EmployeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('E001')).toBeInTheDocument();
      expect(screen.getByText('Backend Team')).toBeInTheDocument();
    });
  });

  it('creates a new employee', async () => {
    (employeeService.createEmployee as any).mockResolvedValue({
      id: 3,
      employeeNo: 'E003',
      name: 'New Employee',
    });

    renderWithProviders(<EmployeeList />);
    
    // Open Modal
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    await waitFor(() => expect(screen.getByRole('dialog', { name: /add employee/i })).toBeInTheDocument());

    // Fill Form
    fireEvent.change(screen.getByPlaceholderText('E.g. E001'), { target: { value: 'E003' } });
    fireEvent.change(screen.getByPlaceholderText('Employee Name'), { target: { value: 'New Employee' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1112223333' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'new@example.com' } });

    // Select Department
    const deptSelect = screen.getByTestId('mock-select');
    fireEvent.change(deptSelect, { target: { value: '3' } });

    // Select Date
    const dateInput = screen.getByTestId('mock-datepicker');
    fireEvent.change(dateInput, { target: { value: '2023-01-01' } });

    // Submit
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(employeeService.createEmployee).toHaveBeenCalledWith(expect.objectContaining({
        employeeNo: 'E003',
        name: 'New Employee',
        deptId: 3,
        phone: '1112223333',
        email: 'new@example.com',
        hireDate: '2023-01-01',
      }));
    });
  });

  it('updates an existing employee', async () => {
    (employeeService.updateEmployee as any).mockResolvedValue({});

    renderWithProviders(<EmployeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const row = screen.getByTestId('row-1');
    const editButton = within(row).getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Wait for modal
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument());
    
    const nameInput = screen.getByDisplayValue('John Doe');
    await user.clear(nameInput);
    await user.type(nameInput, 'John Doe Updated');

    // Submit
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(employeeService.updateEmployee).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'John Doe Updated',
      }));
    });
  });

  it('deletes an employee', async () => {
    (employeeService.deleteEmployee as any).mockResolvedValue({});

    renderWithProviders(<EmployeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const row = screen.getByTestId('row-1');
    const deleteButton = within(row).getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Modal.confirm is mocked to auto-confirm
    await waitFor(() => {
      expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1);
    });
  });

  it('binds a user to an employee', async () => {
    (employeeService.bindUser as any).mockResolvedValue({});

    renderWithProviders(<EmployeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // John Doe (row-1) is unbound
    const row = screen.getByTestId('row-1');
    const bindButton = within(row).getByText('Bind User');
    await user.click(bindButton);

    // BindUserModal opens
    await waitFor(() => expect(screen.getByText('Bind User Account')).toBeInTheDocument());
    
    // Select User
    // The bind modal has a select for users.
    // It fetches users on open.
    await waitFor(() => expect(userService.getUsers).toHaveBeenCalled());

    const select = screen.getByTestId('mock-select');
    // Wait for options to be populated
    await waitFor(() => expect(screen.getByText('newuser')).toBeInTheDocument());
    
    await user.selectOptions(select, '201'); // Select newuser (id=201)

    // Submit
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(employeeService.bindUser).toHaveBeenCalledWith(1, { userId: 201 });
    });
  });

  it('unbinds a user from an employee', async () => {
    (employeeService.bindUser as any).mockResolvedValue({});

    renderWithProviders(<EmployeeList />);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Jane Smith (row-2) is bound
    const row = screen.getByTestId('row-2');
    
    const unbindButton = within(row).getByText('Unbind'); 
    await user.click(unbindButton);

    await waitFor(() => {
      expect(employeeService.bindUser).toHaveBeenCalledWith(2, { userId: null });
    });
  });
});
