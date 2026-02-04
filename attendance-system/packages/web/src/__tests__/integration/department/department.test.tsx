import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepartmentPage from '../../../pages/department/DepartmentPage';
import { renderWithProviders } from '../../../test/utils';
import * as departmentService from '../../../services/department';
import * as employeeService from '../../../services/employee';
import { DepartmentVO } from '@attendance/shared';

// Mock services
vi.mock('../../../services/department');

// Mock child components to isolate Page logic and avoid complex UI rendering issues
vi.mock('../../../pages/department/components/DepartmentTree', () => ({
  DepartmentTree: ({ treeData, onSelect }: any) => {
    const renderNodes = (nodes: any[]) => nodes.map((node: any) => (
      <div key={node.id}>
        <div 
          data-testid={`tree-node-${node.id}`}
          onClick={() => onSelect([node.id])}
        >
          {node.name}
        </div>
        {node.children && node.children.length > 0 && (
          <div style={{ marginLeft: 20 }}>
            {renderNodes(node.children)}
          </div>
        )}
      </div>
    ));
    return (
      <div data-testid="mock-department-tree">
        {renderNodes(treeData)}
      </div>
    );
  },
}));

vi.mock('../../../pages/department/components/DepartmentForm', () => ({
  DepartmentForm: ({ visible, mode, onSuccess, onCancel }: any) => {
    if (!visible) return null;
    return (
      <div data-testid="mock-department-form">
        <span>{mode === 'create' ? 'Create Mode' : 'Edit Mode'}</span>
        <button onClick={onSuccess}>Simulate Submit</button>
        <button onClick={onCancel}>Simulate Cancel</button>
      </div>
    );
  },
}));

// Mock Antd components that are used directly in Page
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
    Modal: {
      ...actual.Modal,
      confirm: ({ onOk }: any) => {
        // Automatically confirm for testing
        onOk();
      },
    },
  };
});

const mockTreeData: DepartmentVO[] = [
  {
    id: 1,
    name: 'Tech Dept',
    parentId: null,
    sortOrder: 1,
    children: [
      {
        id: 2,
        name: 'Backend',
        parentId: 1,
        sortOrder: 1,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
];

const mockDepartmentDetail: DepartmentVO = {
  id: 1,
  name: 'Tech Dept',
  parentId: null,
  sortOrder: 1,
  children: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // @ts-ignore - Assuming extra fields might exist or just partial match needed
  managerId: 'user1', 
};

describe('DepartmentPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    (departmentService.getDepartment as any).mockResolvedValue(mockDepartmentDetail);
    (departmentService.deleteDepartment as any).mockResolvedValue(undefined);
  });

  it('renders and fetches department tree', async () => {
    renderWithProviders(<DepartmentPage />);

    // Verify loading and fetch
    expect(departmentService.getTree).toHaveBeenCalled();
    
    // Verify tree rendering (via mock)
    await waitFor(() => {
      expect(screen.getByTestId('mock-department-tree')).toBeInTheDocument();
      expect(screen.getByText('Tech Dept')).toBeInTheDocument();
      expect(screen.getByText('Backend Team')).toBeInTheDocument();
    });
  });

  it('shows details when a department is selected', async () => {
    renderWithProviders(<DepartmentPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('tree-node-1')).toBeInTheDocument();
    });

    // Click node
    fireEvent.click(screen.getByTestId('tree-node-1'));

    // Verify fetch details
    expect(departmentService.getDepartment).toHaveBeenCalledWith(1);
    
    // Verify details display (DepartmentPage uses Descriptions/Title)
    await waitFor(() => {
      // Assuming DepartmentPage displays the name in Title or Descriptions
      // Based on code: <Descriptions.Item label="部门名称">{selectedDepartment.name}</Descriptions.Item>
      expect(screen.getByText('Tech Dept')).toBeInTheDocument();
    });
  });

  it('opens create form and refreshes tree on success', async () => {
    renderWithProviders(<DepartmentPage />);
    
    // Wait for load
    await waitFor(() => expect(screen.getByText('Tech Dept')).toBeInTheDocument());

    // Click Create Button (text is "新增")
    const createBtn = screen.getByRole('button', { name: /新增/i });
    fireEvent.click(createBtn);

    // Verify Form Open
    expect(screen.getByTestId('mock-department-form')).toBeInTheDocument();
    expect(screen.getByText('Create Mode')).toBeInTheDocument();

    // Simulate Success
    fireEvent.click(screen.getByText('Simulate Submit'));

    // Verify Tree Refresh
    await waitFor(() => {
      expect(departmentService.getTree).toHaveBeenCalledTimes(2); // Initial + Refresh
    });
  });

  it('opens edit form and refreshes tree/detail on success', async () => {
    renderWithProviders(<DepartmentPage />);
    
    // Select a department first to enable Edit
    await waitFor(() => expect(screen.getByTestId('tree-node-1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('tree-node-1'));
    
    // Wait for detail to load
    await waitFor(() => expect(departmentService.getDepartment).toHaveBeenCalled());

    // Click Edit Button
    // Looking at DepartmentPage code: <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
    const editBtn = screen.getByRole('button', { name: /编辑/i });
    fireEvent.click(editBtn);

    // Verify Form Open
    expect(screen.getByTestId('mock-department-form')).toBeInTheDocument();
    expect(screen.getByText('Edit Mode')).toBeInTheDocument();

    // Simulate Success
    fireEvent.click(screen.getByText('Simulate Submit'));

    // Verify Tree Refresh and Detail Refresh
    await waitFor(() => {
      expect(departmentService.getTree).toHaveBeenCalledTimes(2);
      expect(departmentService.getDepartment).toHaveBeenCalledTimes(2); // Initial select + Refresh
    });
  });

  it('deletes department and refreshes tree', async () => {
    renderWithProviders(<DepartmentPage />);
    
    // Select a department first
    await waitFor(() => expect(screen.getByTestId('tree-node-1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('tree-node-1'));
    
    // Wait for detail
    await waitFor(() => expect(departmentService.getDepartment).toHaveBeenCalled());

    // Click Delete Button
    // Looking at DepartmentPage code: <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>删除</Button>
    const deleteBtn = screen.getByRole('button', { name: /删除/i });
    fireEvent.click(deleteBtn);

    // Mock Modal.confirm auto-calls onOk, so service should be called immediately
    await waitFor(() => {
      expect(departmentService.deleteDepartment).toHaveBeenCalledWith(1);
    });

    // Verify Tree Refresh
    await waitFor(() => {
      expect(departmentService.getTree).toHaveBeenCalledTimes(2);
    });
  });
});
