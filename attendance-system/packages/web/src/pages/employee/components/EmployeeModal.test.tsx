import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeModal } from './EmployeeModal';
import { departmentService } from '@/services/department';

// Mock dependencies
vi.mock('@/services/department', () => ({
  departmentService: {
    getTree: vi.fn(),
  },
}));

vi.mock('@/components/common/ToastProvider', () => ({
  useToast: () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  }),
}));

vi.mock('@/components/common/PersonnelSelectionModal', () => ({
  PersonnelSelectionModal: () => <div data-testid="dept-modal">Dept Modal</div>,
  SelectionItem: {},
}));

describe('EmployeeModal', () => {
  const mockOnCancel = vi.fn();
  const mockOnOk = vi.fn();
  const mockDepts = [
    {
      id: 1,
      name: '研发部',
      children: [
        { id: 2, name: '后端组', children: [] },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (departmentService.getTree as any).mockResolvedValue(mockDepts);
  });

  it('should lock department selection when defaultDeptId is provided', async () => {
    render(
      <EmployeeModal
        open={true}
        mode="create"
        defaultDeptId={1}
        onCancel={mockOnCancel}
        onOk={mockOnOk}
      />
    );

    // Wait for departments to load
    await waitFor(() => {
      expect(departmentService.getTree).toHaveBeenCalled();
    });

    const deptInput = screen.getByPlaceholderText('请选择部门');
    expect(deptInput).toBeDisabled();
    expect(deptInput).toHaveValue('研发部');
  });

  it('should allow department selection when defaultDeptId is not provided', async () => {
    render(
      <EmployeeModal
        open={true}
        mode="create"
        onCancel={mockOnCancel}
        onOk={mockOnOk}
      />
    );

    await waitFor(() => {
      expect(departmentService.getTree).toHaveBeenCalled();
    });

    const deptInput = screen.getByPlaceholderText('请选择部门');
    expect(deptInput).not.toBeDisabled();
    // Default to first dept if available, logic in component:
    // if (mode === 'create' && !defaultDeptId && tree.length > 0) { ... deptId: tree[0].id }
    expect(deptInput).toHaveValue('研发部');
  });

  it('should submit undefined for empty email and phone', async () => {
    const user = userEvent.setup();
    render(
      <EmployeeModal
        open={true}
        mode="create"
        defaultDeptId={1}
        onCancel={mockOnCancel}
        onOk={mockOnOk}
      />
    );

    await waitFor(() => {
      expect(departmentService.getTree).toHaveBeenCalled();
    });

    // Fill required fields
    await user.type(screen.getByPlaceholderText('例如: E001'), 'E001');
    await user.type(screen.getByPlaceholderText('请输入姓名'), 'Test User');
    
    // Hire date (input type=date)
    // Note: userEvent.type on date input can be tricky, using fireEvent or direct value set if needed
    // But let's try direct interaction or finding by label
    // The component doesn't have label associated by 'for', finding by adjacent text
    // Or just find by class or type.
    // The component has: <input type="date" ...
    // Let's use container query or getByDisplayValue if we set it.
    // We can just set it via fireEvent change.
    
    // Actually, let's look at how to select the date input.
    // It has `name="hireDate"`.
    const dateInput = document.querySelector('input[name="hireDate"]');
    if (dateInput) {
        await user.type(dateInput, '2023-01-01');
    }

    // Phone and Email are empty by default

    // Click submit
    await user.click(screen.getByText('确定'));

    expect(mockOnOk).toHaveBeenCalledWith(expect.objectContaining({
      employeeNo: 'E001',
      name: 'Test User',
      deptId: 1,
      hireDate: '2023-01-01',
      phone: undefined,
      email: undefined,
    }));
  });
});
