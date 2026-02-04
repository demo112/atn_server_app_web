import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import EmployeeList from '../../pages/employee/EmployeeList';
import { renderWithProviders } from '../../test/utils';

describe('EmployeeList Integration', () => {
  const mockEmployees = [
    {
      id: 1,
      employeeNo: 'EMP001',
      name: '张三',
      phone: '13800138000',
      deptName: '研发部',
      status: 'active',
      username: 'zhangsan', // Linked user
      email: 'zhangsan@example.com',
      hireDate: '2023-01-01',
      deptId: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      employeeNo: 'EMP002',
      name: '李四',
      phone: '13900139000',
      deptName: '测试部',
      status: 'active',
      username: null,
      email: 'lisi@example.com',
      hireDate: '2023-02-01',
      deptId: 2,
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z',
    },
  ];

  beforeAll(() => {
    // vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const setupServer = (): void => {
    server.use(
      http.get('http://localhost:3000/api/v1/employees', ({ request }) => {
        const url = new URL(request.url);
        const keyword = url.searchParams.get('keyword');
        let data = mockEmployees;
        if (keyword) {
            data = mockEmployees.filter(e => e.name.includes(keyword) || e.employeeNo.includes(keyword));
        }
        return HttpResponse.json({
          success: true,
          data: {
            items: data,
            total: data.length,
            page: 1,
            pageSize: 10,
            totalPages: Math.ceil(data.length / 10),
          }
        });
      }),
      http.delete('http://localhost:3000/api/v1/employees/:id', () => {
        return HttpResponse.json({ success: true });
      }),
      http.post('http://localhost:3000/api/v1/employees', () => {
        return HttpResponse.json({ success: true, data: { id: 3 } });
      }),
      http.put('http://localhost:3000/api/v1/employees/:id', () => {
        return HttpResponse.json({ success: true });
      }),
       http.get('http://localhost:3000/api/v1/departments/tree', () => {
           return HttpResponse.json({ success: true, data: [] });
       })
    );
  };

  it('should load and render employee list', async () => {
    setupServer();
    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('EMP001')).toBeInTheDocument();
    });
  });

  it('should filter employees by keyword', async () => {
    setupServer();
    renderWithProviders(<EmployeeList />);

    await waitFor(() => {
        expect(screen.getByText('张三')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name/no');
    await userEvent.type(searchInput, '张三{enter}');
    
    await waitFor(() => {
        expect(screen.queryByText('李四')).not.toBeInTheDocument();
        expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  it('should open add employee modal', async () => {
    setupServer();
    renderWithProviders(<EmployeeList />);

    await userEvent.click(screen.getByText('Add Employee'));
    
    await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /Add Employee/i })).toBeInTheDocument();
    });
  });
  
  it('should delete employee', async () => {
        setupServer();
        const user = userEvent.setup();
        
        renderWithProviders(<EmployeeList />);
        
        await waitFor(() => {
            expect(screen.getByText('张三')).toBeInTheDocument();
        });

        // Find delete button for first row
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        expect(deleteButtons.length).toBeGreaterThan(0);
        await user.click(deleteButtons[0]);
        
        // Verify StandardModal appears
        const modal = await screen.findByRole('dialog', { name: /Are you sure to delete this employee\?/i });
        expect(modal).toBeInTheDocument();
        
        // Find and click "确定" button in modal
        const confirmButton = within(modal).getByRole('button', { name: '确定' });
        await user.click(confirmButton);
        
        // Wait for success toast
        await waitFor(() => {
            expect(screen.getByText('Deleted successfully')).toBeInTheDocument();
        });
    });

});
