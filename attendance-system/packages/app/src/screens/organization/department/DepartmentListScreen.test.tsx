import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { DepartmentListScreen } from './DepartmentListScreen';
import { getDepartmentTree, deleteDepartment } from '../../../services/department';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../../services/department');
jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock Navigation
const mockNavigate = jest.fn();
const mockPush = jest.fn();
const mockSetOptions = jest.fn();
const mockAddListener = jest.fn(() => jest.fn()); // Returns unsubscribe function

const mockNavigation = {
  navigate: mockNavigate,
  push: mockPush,
  setOptions: mockSetOptions,
  addListener: mockAddListener,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('DepartmentListScreen', () => {
  const mockTree = [
    {
      id: 1,
      name: '研发部',
      children: [
        { id: 11, name: '后端组', children: [] },
        { id: 12, name: '前端组', children: [] },
      ],
    },
    {
      id: 2,
      name: '人事部',
      children: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getDepartmentTree as jest.Mock).mockResolvedValue(mockTree);
    // Default route params
    require('@react-navigation/native').useRoute.mockReturnValue({
        params: {}
    });
  });

  it('renders loading state initially', async () => {
    (getDepartmentTree as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    const { getByTestId } = render(<DepartmentListScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders root departments when no parentId', async () => {
    const { getByText, getByTestId } = render(<DepartmentListScreen />);

    await waitFor(() => {
      expect(getByTestId('department-list')).toBeTruthy();
    });

    expect(getByText('研发部')).toBeTruthy();
    expect(getByText('人事部')).toBeTruthy();
  });

  it('renders sub-departments when parentId is provided', async () => {
    require('@react-navigation/native').useRoute.mockReturnValue({
        params: { parentId: 1, title: '研发部' }
    });

    const { getByText, queryByText } = render(<DepartmentListScreen />);

    await waitFor(() => {
        expect(getByText('后端组')).toBeTruthy();
        expect(getByText('前端组')).toBeTruthy();
    });

    expect(queryByText('人事部')).toBeNull();
  });

  it('renders empty state when no children', async () => {
     require('@react-navigation/native').useRoute.mockReturnValue({
        params: { parentId: 2, title: '人事部' }
    });

    const { getByTestId } = render(<DepartmentListScreen />);

    await waitFor(() => {
        expect(getByTestId('empty-text')).toBeTruthy();
    });
  });

  it('navigates to sub-department on press', async () => {
    const { getByText } = render(<DepartmentListScreen />);

    await waitFor(() => expect(getByText('研发部')).toBeTruthy());

    fireEvent.press(getByText('研发部'));

    expect(mockPush).toHaveBeenCalledWith('DepartmentList', {
      parentId: 1,
      title: '研发部',
    });
  });

  it('configures header right button for adding new department', async () => {
    require('@react-navigation/native').useRoute.mockReturnValue({
        params: { parentId: 1 }
    });
    
    render(<DepartmentListScreen />);

    await waitFor(() => expect(mockSetOptions).toHaveBeenCalled());

    // Extract the headerRight function from the last call to setOptions
    const setOptionsCall = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1][0];
    const HeaderRight = setOptionsCall.headerRight;
    
    // Render the HeaderRight component to test it
    const { getByTestId } = render(<HeaderRight />);
    const addBtn = getByTestId('header-add-btn');
    
    fireEvent.press(addBtn);
    expect(mockNavigate).toHaveBeenCalledWith('DepartmentEdit', { parentId: 1 });
  });

  it('handles delete flow via long press', async () => {
    const { getByText } = render(<DepartmentListScreen />);

    await waitFor(() => expect(getByText('研发部')).toBeTruthy());

    // Long press to trigger alert
    fireEvent(getByText('研发部'), 'onLongPress');

    expect(Alert.alert).toHaveBeenCalled();
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const alertArgs = alertCalls[alertCalls.length - 1];
    expect(alertArgs[0]).toBe('操作');
    
    // Find '删除' button
    const deleteBtn = alertArgs[2].find((btn: any) => btn.text === '删除');
    expect(deleteBtn).toBeTruthy();

    // Mock delete success
    (deleteDepartment as jest.Mock).mockResolvedValue(true);

    // Confirm delete (ActionSheet)
    await act(async () => {
        await deleteBtn.onPress();
    });

    // Verify confirmation alert
    expect(Alert.alert).toHaveBeenCalledTimes(2);
    const confirmAlertCalls = (Alert.alert as jest.Mock).mock.calls;
    const confirmAlertArgs = confirmAlertCalls[confirmAlertCalls.length - 1];
    expect(confirmAlertArgs[0]).toBe('确认删除');

    // Find '删除' button in confirmation alert
    const confirmDeleteBtn = confirmAlertArgs[2].find((btn: any) => btn.text === '删除');
    expect(confirmDeleteBtn).toBeTruthy();

    // Confirm actual delete
    await act(async () => {
        await confirmDeleteBtn.onPress();
    });

    expect(deleteDepartment).toHaveBeenCalledWith(1);
    // Should reload data
    expect(getDepartmentTree).toHaveBeenCalledTimes(2); // Initial load + after delete
  });

  it('handles edit flow via long press', async () => {
    const { getByText } = render(<DepartmentListScreen />);

    await waitFor(() => expect(getByText('研发部')).toBeTruthy());

    fireEvent(getByText('研发部'), 'onLongPress');

    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const alertArgs = alertCalls[alertCalls.length - 1];
    
    const editBtn = alertArgs[2].find((btn: any) => btn.text === '编辑');
    
    act(() => {
        editBtn.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('DepartmentEdit', { id: 1 });
  });

  it('reloads data on focus', async () => {
    render(<DepartmentListScreen />);

    await waitFor(() => expect(getDepartmentTree).toHaveBeenCalledTimes(1));

    // Get the focus listener
    const focusListener = mockAddListener.mock.calls.find(call => call[0] === 'focus')[1];
    
    // Trigger focus
    await act(async () => {
        focusListener();
    });

    expect(getDepartmentTree).toHaveBeenCalledTimes(2);
  });

  it('handles load error gracefully', async () => {
    (getDepartmentTree as jest.Mock).mockRejectedValue(new Error('Network Error'));
    
    render(<DepartmentListScreen />);

    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('错误', '加载失败'));
  });
});
