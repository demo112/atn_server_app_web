/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import AddPersonModal from './AddPersonModal';

// Mock dependencies
vi.mock('../../../services/employee', () => ({
  employeeService: {
    createEmployee: vi.fn(),
  },
}));

// Mock BasicInfoForm to simplify testing or use real one?
// Using real one is better for integration test, but might be complex with Sidebar etc.
// Let's use real one but mock PersonnelSelectionModal
vi.mock('@/components/common/PersonnelSelectionModal', () => ({
  default: ({ isOpen, onConfirm, title }: any) => isOpen ? (
    <div data-testid="dept-modal">
      <div>{title}</div>
      <button onClick={() => onConfirm([{ id: '1', name: '研发部', type: 'department' }])}>Select Dept</button>
    </div>
  ) : null,
}));

describe('AddPersonModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default department if provided', () => {
    render(
      <AddPersonModal
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        // @ts-ignore - testing new prop before implementation
        defaultDeptId={1}
        defaultDeptName="研发部"
      />
    );

    const deptInput = screen.getByPlaceholderText('请选择部门');
    expect(deptInput).toHaveValue('研发部');
    // Should be locked/disabled or readOnly with specific class
    // We'll check behavior later
  });

  it('should validate required fields on save', async () => {
    // Mock alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <AddPersonModal
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const saveBtn = screen.getByText('确定');
    fireEvent.click(saveBtn);

    expect(alertMock).toHaveBeenCalledWith('请输入姓名');
  });
});
