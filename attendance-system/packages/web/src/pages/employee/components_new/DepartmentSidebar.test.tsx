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

  it('renders department tree correctly', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    
    render(<DepartmentSidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('研发部')).toBeInTheDocument();
      expect(screen.getByText('市场部')).toBeInTheDocument();
    });
    
    // Should have virtual root "全公司"
    expect(screen.getByText('全公司')).toBeInTheDocument();
  });

  it('handles department selection', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    const onSelect = vi.fn();
    
    render(<DepartmentSidebar onSelect={onSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('研发部')).toBeInTheDocument();
    });
    
    // Click a node
    fireEvent.click(screen.getByText('研发部'));
    
    // Should call onSelect with the ID '1'
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('handles root selection', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    const onSelect = vi.fn();
    
    render(<DepartmentSidebar onSelect={onSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('全公司')).toBeInTheDocument();
    });
    
    // Click root
    fireEvent.click(screen.getByText('全公司'));
    
    // Should call onSelect with empty string
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('root node has only add button', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    
    render(<DepartmentSidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('全公司')).toBeInTheDocument();
    });

    const node = screen.getByText('全公司').closest('.group');
    const buttons = node?.querySelectorAll('button');
    
    // Root should only have Add button
    expect(buttons?.length).toBe(1);
    expect(buttons?.[0]).toHaveAttribute('title', '添加子部门');
  });

  it('child node has all buttons', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    
    render(<DepartmentSidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('研发部')).toBeInTheDocument();
    });

    const node = screen.getByText('研发部').closest('.group');
    const buttons = node?.querySelectorAll('button');
    
    // Child should have 3 buttons: Add, Edit, Delete
    expect(buttons?.length).toBe(3);
  });
});
