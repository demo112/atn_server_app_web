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
    
    // Should NOT have virtual root "全公司"
    expect(screen.queryByText('全公司')).not.toBeInTheDocument();
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

  it('department node has all buttons', async () => {
    (departmentService.getTree as any).mockResolvedValue(mockTreeData);
    
    render(<DepartmentSidebar />);
    
    await waitFor(() => {
      expect(screen.getByText('研发部')).toBeInTheDocument();
    });

    const node = screen.getByText('研发部').closest('.group');
    const buttons = node?.querySelectorAll('button');
    
    // Expect 3 buttons: Add, Edit, Delete
    expect(buttons?.length).toBe(3);
  });
});
