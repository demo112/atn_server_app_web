import React from 'react';
import { View, Button, Text } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { DepartmentEditScreen } from './DepartmentEditScreen';
import { createDepartment, updateDepartment, getDepartmentById } from '../../../services/department';
import { Alert } from 'react-native';

// Mock services
jest.mock('../../../services/department');
jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock DepartmentSelect with standard RN components
jest.mock('../../../components/DepartmentSelect', () => {
  const React = require('react');
  const { View, Button } = require('react-native');
  return {
    DepartmentSelect: ({ visible, onSelect, onClose }: any) => {
      if (!visible) return null;
      return React.createElement(View, { testID: 'department-select-modal' }, [
        React.createElement(Button, {
          key: 'select',
          title: 'Select Parent',
          onPress: () => onSelect({ id: 99, name: '父部门' }),
          testID: 'mock-select-btn'
        }),
        React.createElement(Button, {
          key: 'close',
          title: 'Close',
          onPress: onClose,
          testID: 'mock-close-btn'
        })
      ]);
    }
  };
});

// Mock Navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: mockSetOptions,
  addListener: jest.fn(() => jest.fn()),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('DepartmentEditScreen', () => {
  const mockDept = {
    id: 1,
    name: '研发部',
    parentId: null,
    sortOrder: 10,
    children: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDepartmentById as jest.Mock).mockResolvedValue(mockDept);
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      require('@react-navigation/native').useRoute.mockReturnValue({
        params: {}
      });
    });

    it('renders create mode correctly', async () => {
      render(<DepartmentEditScreen />);

      await waitFor(() => {
        expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({
          title: '新增部门'
        }));
      });
    });

    it('pre-fills parent info if provided in params', async () => {
       require('@react-navigation/native').useRoute.mockReturnValue({
        params: { parentId: 5 }
      });
      (getDepartmentById as jest.Mock).mockResolvedValue({ id: 5, name: '预设父部门' });

      const { getByText } = render(<DepartmentEditScreen />);

      await waitFor(() => {
          expect(getByText('预设父部门')).toBeTruthy();
      });
    });

    it('validates empty name', async () => {
      render(<DepartmentEditScreen />);

      // Get header save button from setOptions call
      const HeaderRight = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1][0].headerRight;
      const { getByTestId } = render(<HeaderRight />);
      
      fireEvent.press(getByTestId('header-save-btn'));

      expect(Alert.alert).toHaveBeenCalledWith('提示', '请输入部门名称');
      expect(createDepartment).not.toHaveBeenCalled();
    });

    it('creates department successfully', async () => {
      const { getByTestId } = render(<DepartmentEditScreen />);

      fireEvent.changeText(getByTestId('input-name'), '测试部门');
      fireEvent.changeText(getByTestId('input-sort'), '99');

      // Get save button
      const HeaderRight = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1][0].headerRight;
      const { getByTestId: getBtn } = render(<HeaderRight />);
      
      (createDepartment as jest.Mock).mockResolvedValue({ id: 2 });

      await act(async () => {
        fireEvent.press(getBtn('header-save-btn'));
      });

      expect(createDepartment).toHaveBeenCalledWith({
        name: '测试部门',
        parentId: undefined,
        sortOrder: 99,
      });

      // Check success alert and callback
      expect(Alert.alert).toHaveBeenCalledWith(
        '成功', 
        '创建成功', 
        expect.any(Array)
      );
      
      // Execute alert OK callback
      const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
      const okBtn = alertArgs[2][0];
      okBtn.onPress();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      require('@react-navigation/native').useRoute.mockReturnValue({
        params: { id: 1 }
      });
    });

    it('loads and renders existing details', async () => {
      const { getByTestId } = render(<DepartmentEditScreen />);

      await waitFor(() => {
        expect(getByTestId('input-name').props.value).toBe('研发部');
        expect(getByTestId('input-sort').props.value).toBe('10');
      });

      expect(mockSetOptions).toHaveBeenCalledWith(expect.objectContaining({
        title: '编辑部门'
      }));
    });

    it('loads parent details if exists', async () => {
        const deptWithParent = { ...mockDept, parentId: 2 };
        (getDepartmentById as jest.Mock)
            .mockResolvedValueOnce(deptWithParent) // for main load
            .mockResolvedValueOnce({ id: 2, name: '上级部门' }); // for parent load

        const { getByText } = render(<DepartmentEditScreen />);

        await waitFor(() => {
            expect(getByText('上级部门')).toBeTruthy();
        });
    });

    it('updates department successfully', async () => {
      const { getByTestId } = render(<DepartmentEditScreen />);
      
      await waitFor(() => expect(getByTestId('input-name').props.value).toBe('研发部'));

      fireEvent.changeText(getByTestId('input-name'), '研发部-更新');

      const HeaderRight = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1][0].headerRight;
      const { getByTestId: getBtn } = render(<HeaderRight />);
      
      (updateDepartment as jest.Mock).mockResolvedValue(true);

      await act(async () => {
        fireEvent.press(getBtn('header-save-btn'));
      });

      expect(updateDepartment).toHaveBeenCalledWith(1, {
        name: '研发部-更新',
        parentId: undefined, // mockDept has parentId: null
        sortOrder: 10,
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        '成功', 
        '更新成功', 
        expect.any(Array)
      );
    });
  });

  describe('Parent Selection', () => {
    it('handles parent selection', async () => {
      require('@react-navigation/native').useRoute.mockReturnValue({
        params: {}
      });

      const { getByTestId, getByText, queryByTestId } = render(<DepartmentEditScreen />);

      // Open selector
      fireEvent.press(getByTestId('select-parent'));

      // Verify modal is shown
      expect(getByTestId('department-select-modal')).toBeTruthy();

      // Select parent
      fireEvent.press(getByTestId('mock-select-btn'));

      // Verify modal is closed and text updated
      expect(queryByTestId('department-select-modal')).toBeNull();
      expect(getByText('父部门')).toBeTruthy();
    });
  });
  
  describe('Error Handling', () => {
     it('handles load detail error', async () => {
         require('@react-navigation/native').useRoute.mockReturnValue({
            params: { id: 1 }
         });
         (getDepartmentById as jest.Mock).mockRejectedValue(new Error('Load failed'));
         
         render(<DepartmentEditScreen />);
         
         // Error is logged but no alert in loadDetail, just spinner stops
         // We can verify logger call
         await waitFor(() => {
             const { logger } = require('../../../utils/logger');
             expect(logger.error).toHaveBeenCalled();
         });
     });

     it('handles save error', async () => {
         require('@react-navigation/native').useRoute.mockReturnValue({ params: {} });
         (createDepartment as jest.Mock).mockRejectedValue(new Error('Save failed'));
         
         const { getByTestId } = render(<DepartmentEditScreen />);
         fireEvent.changeText(getByTestId('input-name'), 'Fail Dept');
         
         const HeaderRight = mockSetOptions.mock.calls[mockSetOptions.mock.calls.length - 1][0].headerRight;
         const { getByTestId: getBtn } = render(<HeaderRight />);
         
         await act(async () => {
            fireEvent.press(getBtn('header-save-btn'));
         });
         
         expect(Alert.alert).toHaveBeenCalledWith('错误', '保存失败');
     });
  });
});
