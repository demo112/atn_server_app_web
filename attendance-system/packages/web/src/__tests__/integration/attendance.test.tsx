import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import AttendanceDetailsPage from '../../pages/attendance/details/AttendanceDetailsPage';
import { MemoryRouter } from 'react-router-dom';

describe('AttendanceDetailsPage Integration', () => {
  const mockRecords = [
    {
      id: 1,
      employeeId: 101,
      employeeNo: 'EMP001',
      employeeName: '张三',
      deptName: '研发部',
      workDate: '2024-03-20',
      checkInTime: '2024-03-20 08:55:00',
      checkOutTime: '2024-03-20 18:05:00',
      status: 'normal',
      workMinutes: 480,
      lateMinutes: 0,
      earlyLeaveMinutes: 0,
      absentMinutes: 0,
      leaveMinutes: 0,
    },
    {
      id: 2,
      employeeId: 102,
      employeeNo: 'EMP002',
      employeeName: '李四',
      deptName: '市场部',
      workDate: '2024-03-20',
      checkInTime: '2024-03-20 09:10:00',
      checkOutTime: null,
      status: 'late',
      workMinutes: 0,
      lateMinutes: 10,
      earlyLeaveMinutes: 0,
      absentMinutes: 0,
      leaveMinutes: 0,
    },
  ];

  beforeEach(() => {
    // Mock APIs
    server.use(
      // Mock department tree for filter
      http.get('*/departments/tree', () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 1,
              name: '总经办',
              parentId: null,
              sortOrder: 1,
              createdAt: '2023-01-01',
              updatedAt: '2023-01-01',
              children: [
                { 
                  id: 2, 
                  name: '研发部', 
                  parentId: 1,
                  sortOrder: 1,
                  createdAt: '2023-01-01',
                  updatedAt: '2023-01-01',
                  children: [] 
                },
                { 
                  id: 3, 
                  name: '市场部', 
                  parentId: 1,
                  sortOrder: 2,
                  createdAt: '2023-01-01',
                  updatedAt: '2023-01-01',
                  children: [] 
                },
              ],
            },
          ],
        });
      }),
      // Mock daily records
      http.get('*/attendance/daily', ({ request }) => {
        const url = new URL(request.url);
        const employeeName = url.searchParams.get('employeeName');
        
        let filtered = [...mockRecords];
        if (employeeName) {
          filtered = filtered.filter(r => r.employeeName.includes(employeeName));
        }

        return HttpResponse.json({
          success: true,
          data: {
            items: filtered,
            total: filtered.length,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        });
      })
    );
  });

  it('should render attendance records', async () => {
    render(
      <MemoryRouter>
        <AttendanceDetailsPage />
      </MemoryRouter>
    );

    // Check loading state or wait for data
    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    expect(screen.getByText('研发部')).toBeInTheDocument();
    expect(screen.getByText('正常')).toBeInTheDocument(); // Status tag
    
    expect(screen.getByText('李四')).toBeInTheDocument();
    expect(screen.getByText('迟到')).toBeInTheDocument();
  });

  it('should filter records', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AttendanceDetailsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
    });

    // Expand search form if needed
    // The component has a Form with input name="employeeName"
    const nameInput = screen.getByPlaceholderText('姓名/工号');
    await user.type(nameInput, '张三');

    const searchBtn = screen.getByRole('button', { name: /查询/i });
    await user.click(searchBtn);

    await waitFor(() => {
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.queryByText('李四')).not.toBeInTheDocument();
    });
  });
});
