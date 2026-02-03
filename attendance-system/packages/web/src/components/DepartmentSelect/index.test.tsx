import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DepartmentSelect } from './index';
import { departmentService } from '../../services/department';

// Mock service
vi.mock('../../services/department', () => ({
  departmentService: {
    getTree: vi.fn(),
  },
}));

describe('DepartmentSelect', () => {
  const mockTreeData = [
    {
      id: '1',
      name: '研发部',
      children: [
        { id: '2', name: '后端组', children: [] },
        { id: '3', name: '前端组', children: [] },
      ],
    },
    {
      id: '4',
      name: '市场部',
      children: [],
    },
  ];

  it('should render correctly and load data', async () => {
    (departmentService.getTree as any).mockResolvedValue({
      success: true,
      data: mockTreeData,
    });

    render(<DepartmentSelect />);

    // Initial loading state might be too fast to catch without artificial delay,
    // but we can verify the TreeSelect is present.
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Click to open dropdown
    await userEvent.click(select);

    // Verify options are rendered
    await waitFor(() => {
      expect(screen.getByTitle('研发部')).toBeInTheDocument();
      expect(screen.getByTitle('市场部')).toBeInTheDocument();
    });
  });

  it('should handle selection', async () => {
    (departmentService.getTree as any).mockResolvedValue({
      success: true,
      data: mockTreeData,
    });

    const handleChange = vi.fn();
    render(<DepartmentSelect onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    await userEvent.click(select);

    await waitFor(() => {
      expect(screen.getByTitle('研发部')).toBeInTheDocument();
    });

    // Expand 研发部 node if needed or select directly. 
    // Antd TreeSelect behaves like a tree.
    // Let's try selecting '研发部'
    const option = screen.getByTitle('研发部');
    await userEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('1', expect.anything(), expect.anything());
  });

  it('should handle API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (departmentService.getTree as any).mockRejectedValue(new Error('Fetch error'));

    render(<DepartmentSelect />);
    
    // Should still render the component without crashing
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Wait for effect to finish
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });
});
