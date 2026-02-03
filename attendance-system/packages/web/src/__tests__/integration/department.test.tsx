import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import DepartmentPage from '../../pages/department/DepartmentPage';
import { MemoryRouter } from 'react-router-dom';

describe('DepartmentPage Integration', () => {
  const mockTree = [
    {
      id: 1,
      name: '研发部',
      children: [
        { id: 2, name: '后端组', children: [] },
      ],
    },
  ];

  const mockDepartment = {
    id: 1,
    name: '研发部',
    parentId: null,
    sortOrder: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should load and render department tree', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/departments/tree', () => {
        return HttpResponse.json({
          success: true,
          data: mockTree,
        });
      })
    );

    render(
      <MemoryRouter>
        <DepartmentPage />
      </MemoryRouter>
    );
    
    // Wait for tree to load
    await waitFor(() => {
      expect(screen.getByText('研发部')).toBeInTheDocument();
      expect(screen.getByText('后端组')).toBeInTheDocument();
    });
  });

  it('should view department details when selected', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/departments/tree', () => {
        return HttpResponse.json({ success: true, data: mockTree });
      }),
      http.get('http://localhost:3000/api/v1/departments/1', () => {
        return HttpResponse.json({ success: true, data: mockDepartment });
      })
    );

    render(
      <MemoryRouter>
        <DepartmentPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('研发部')).toBeInTheDocument();
    });

    // Select node. 
    await userEvent.click(screen.getByText('研发部'));

    await waitFor(() => {
      expect(screen.getByText('部门ID')).toBeInTheDocument();
      // Use getAllByText for '研发部' because it appears in tree and title and maybe breadcrumb/descriptions
      expect(screen.getAllByText('研发部').length).toBeGreaterThan(1);
    });
  });

  it('should open create modal', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/departments/tree', () => {
        return HttpResponse.json({ success: true, data: mockTree });
      })
    );

    render(
      <MemoryRouter>
        <DepartmentPage />
      </MemoryRouter>
    );

    const addButton = screen.getByRole('button', { name: /新增/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('新建部门')).toBeInTheDocument();
      expect(screen.getByLabelText(/部门名称/i)).toBeInTheDocument();
    });
  });
});
