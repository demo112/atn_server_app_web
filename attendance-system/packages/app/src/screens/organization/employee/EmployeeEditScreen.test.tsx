import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { EmployeeEditScreen } from './EmployeeEditScreen';
import { createEmployee, updateEmployee, getEmployeeById } from '../../../services/employee';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../../services/employee', () => ({
  createEmployee: jest.fn(),
  updateEmployee: jest.fn(),
  getEmployeeById: jest.fn(),
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  logger: { error: jest.fn() },
}));

// Mock DepartmentSelect
jest.mock('../../../components/DepartmentSelect', () => {
  const React = require('react');
  const { View, Button } = require('react-native');
  return {
    DepartmentSelect: ({ visible, onSelect }: any) => (
      visible ? (
        <View testID="department-select-modal">
           <Button title="Select Dept" onPress={() => onSelect({ id: 101, name: 'Test Dept' })} />
        </View>
      ) : null
    ),
  };
});

// Mock navigation
const mockSetOptions = jest.fn();
const mockGoBack = jest.fn();
const mockRoute = { params: {} };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    setOptions: mockSetOptions,
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('EmployeeEditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute.params = {}; // Default create mode
  });

  it('renders create mode correctly', () => {
    const { getByText, getByPlaceholderText } = render(<EmployeeEditScreen />);

    expect(getByText('姓名 *')).toBeTruthy();
    expect(getByPlaceholderText('请输入姓名')).toBeTruthy();
    expect(getByText('请选择部门')).toBeTruthy();
  });

  it('renders edit mode correctly and loads detail', async () => {
    mockRoute.params = { id: 1 };
    (getEmployeeById as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'John Doe',
      employeeNo: 'E001',
      deptId: 101,
      deptName: 'IT Dept',
    });

    const { getByDisplayValue, getByText } = render(<EmployeeEditScreen />);

    await waitFor(() => {
      expect(getEmployeeById).toHaveBeenCalledWith(1);
      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByDisplayValue('E001')).toBeTruthy();
      expect(getByText('IT Dept')).toBeTruthy();
    });
  });

  it('validates required fields', async () => {
    const { getByText } = render(<EmployeeEditScreen />);
    
    // Get the Save button from navigation options
    const setOptionsCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1];
    const headerRight = setOptionsCall[0].headerRight();
    const { getByText: getByTextBtn } = render(headerRight);
    
    fireEvent.press(getByTextBtn('保存'));

    expect(Alert.alert).toHaveBeenCalledWith('提示', '请输入姓名');
  });

  it('creates employee successfully', async () => {
    (createEmployee as jest.Mock).mockResolvedValue({ id: 1 });

    const { getByPlaceholderText, getByText, queryByTestId } = render(<EmployeeEditScreen />);

    // Fill form
    fireEvent.changeText(getByPlaceholderText('请输入姓名'), 'New Employee');
    fireEvent.changeText(getByPlaceholderText('请输入工号'), 'E999');
    
    // Select department
    fireEvent.press(getByText('请选择部门')); // Open modal
    // Mock select
    fireEvent.press(getByText('Select Dept')); // Inside mocked DepartmentSelect
    
    expect(getByText('Test Dept')).toBeTruthy();

    // Save
    const setOptionsCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1];
    const headerRight = setOptionsCall[0].headerRight();
    const { getByText: getByTextBtn } = render(headerRight);
    
    await act(async () => {
        fireEvent.press(getByTextBtn('保存'));
    });

    expect(createEmployee).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Employee',
      employeeNo: 'E999',
      deptId: 101,
    }));

    expect(Alert.alert).toHaveBeenCalledWith('成功', '创建成功', expect.any(Array));
  });

  it('updates employee successfully', async () => {
    mockRoute.params = { id: 1 };
    (getEmployeeById as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Old Name',
      employeeNo: 'E001',
      deptId: 101,
      deptName: 'Test Dept',
    });
    (updateEmployee as jest.Mock).mockResolvedValue({ id: 1 });

    const { getByDisplayValue } = render(<EmployeeEditScreen />);

    await waitFor(() => expect(getByDisplayValue('Old Name')).toBeTruthy());

    fireEvent.changeText(getByDisplayValue('Old Name'), 'New Name');

    // Save
    const setOptionsCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1];
    const headerRight = setOptionsCall[0].headerRight();
    const { getByText: getByTextBtn } = render(headerRight);
    
    await act(async () => {
        fireEvent.press(getByTextBtn('保存'));
    });

    expect(updateEmployee).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'New Name',
    }));
  });
});
