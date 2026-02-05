// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DepartmentSidebar from './DepartmentSidebar';
import { departmentService } from '../../../services/department';

// Mock service
vi.mock('../../../services/department', () => ({
  departmentService: {
    getTree: vi.fn(),
    deleteDepartment: vi.fn(),
  },
}));

const mockTreeData = [
  {
    id: 1,
    name: '研发部',
    children: []
  },
  {
    id: 2,
    name: '市场部',
    children: []
  }
];

describe('DepartmentSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders root node correctly', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    
    render(<DepartmentSidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('全公司')).toBeInTheDocument();
    });
    
    expect(screen.getByText('研发部')).toBeInTheDocument();
    expect(screen.getByText('市场部')).toBeInTheDocument();
  });

  it('handles root node selection', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    const onSelect = vi.fn();
    
    render(<DepartmentSidebar onSelect={onSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('全公司')).toBeInTheDocument();
    });
    
    // Click root node
    fireEvent.click(screen.getByText('全公司'));
    
    // Should call onSelect with empty string
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('root node has add button but no edit/delete buttons', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    
    render(<DepartmentSidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('全公司')).toBeInTheDocument();
    });

    const rootNode = screen.getByText('全公司').closest('.group');
    expect(rootNode).not.toBeNull();
    
    // Check buttons within root node
    // Note: Buttons are hidden by opacity but present in DOM
    const buttons = rootNode?.querySelectorAll('button');
    // Expect only 1 button (Add)
    expect(buttons?.length).toBe(1);
    expect(buttons?.[0].title).toBe('添加子部门');
  });

  it('child node has all buttons', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    
    render(<DepartmentSidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('研发部')).toBeInTheDocument();
    });

    const childNode = screen.getByText('研发部').closest('.group');
    const buttons = childNode?.querySelectorAll('button');
    
    // Expect 3 buttons: Add, Edit, Delete
    expect(buttons?.length).toBe(3);
  });
});
