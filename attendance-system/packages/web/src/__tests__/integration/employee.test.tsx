import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import EmployeeList from '../../pages/employee/EmployeeList';
import { MemoryRouter } from 'react-router-dom';
import { Modal, message } from 'antd';

// Mock child components to simplify integration test
// But for integration test, we usually want to test real components. 
// However, if they are complex, we can mock them.
// Let's try to use real components first, but if they depend on other services, we might need to mock services.
// Assuming EmployeeModal and BindUserModal are present.

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
       // Need to mock departments tree for EmployeeModal usually, but maybe it's lazy loaded or mocked globally?
       // Let's add it here just in case EmployeeModal fetches it.
       http.get('http://localhost:3000/api/v1/departments/tree', () => {
           return HttpResponse.json({ success: true, data: [] });
       })
    );
  };

  it('should load and render employee list', async () => {
    setupServer();
    render(
      <MemoryRouter>
        <EmployeeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('李四')).toBeInTheDocument();
      expect(screen.getByText('EMP001')).toBeInTheDocument();
    });
  });

  it('should filter employees by keyword', async () => {
    setupServer();
    render(
      <MemoryRouter>
        <EmployeeList />
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText('张三')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name/no');
    await userEvent.type(searchInput, '张三{enter}');
    // Or click search button if form.submit() is triggered by enter. 
    // The code says onSearch={() => form.submit()}.
    
    // We expect filter to happen.
    // In our mock, we filter by keyword.
    
    // Wait for list update. Since '张三' is still there, we check '李四' is gone.
    await waitFor(() => {
        expect(screen.queryByText('李四')).not.toBeInTheDocument();
        expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  it('should open add employee modal', async () => {
    setupServer();
    render(
      <MemoryRouter>
        <EmployeeList />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText('Add Employee'));
    
    await waitFor(() => {
        // Check for modal title or some field
        // Assuming EmployeeModal has title 'Create Employee' or similar. 
        // Or check for form fields like 'Name', 'Phone'
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument(); 
        // Note: Antd Form Item label might not be directly associated with input for getByLabelText sometimes, 
        // but let's try. If fails, use getByText.
    });
  });
  
  it('should delete employee', async () => {
        setupServer();
        
        // Spy on Modal.confirm
        const confirmSpy = vi.spyOn(Modal, 'confirm');
        confirmSpy.mockImplementation((config) => {
            // Simulate user clicking OK
            if (config && config.onOk) {
                config.onOk(); 
            }
            return { destroy: vi.fn(), update: vi.fn() };
        });

        // Spy on message.success
        const messageSpy = vi.spyOn(message, 'success');

        render(
          <MemoryRouter>
            <EmployeeList />
          </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(screen.getByText('张三')).toBeInTheDocument();
        });

        // Find delete button for first row
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        expect(deleteButtons.length).toBeGreaterThan(0);
        await userEvent.click(deleteButtons[0]);
        
        // Verify Modal.confirm was called
        expect(confirmSpy).toHaveBeenCalled();
        
        // Wait for success message call
        await waitFor(() => {
            expect(messageSpy).toHaveBeenCalledWith(expect.stringMatching(/Deleted successfully/i));
        });
    });

});
