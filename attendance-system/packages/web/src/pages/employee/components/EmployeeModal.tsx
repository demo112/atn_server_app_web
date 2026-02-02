import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeVo } from '@attendance/shared';
import dayjs from 'dayjs';

interface EmployeeModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: EmployeeVo | null;
  onCancel: () => void;
  onOk: (values: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>;
  confirmLoading?: boolean;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open,
  mode,
  initialValues,
  onCancel,
  onOk,
  confirmLoading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && mode === 'edit' && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        hireDate: initialValues.hireDate ? dayjs(initialValues.hireDate) : undefined,
      });
    } else if (open && mode === 'create') {
      form.resetFields();
    }
  }, [open, mode, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('EmployeeModal validateFields result:', values);

      // Format date
      const formattedValues = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : undefined,
      };

      // Double check for employeeNo in create mode
      if (mode === 'create' && !formattedValues.employeeNo) {
        console.error('Critical Error: employeeNo is missing in create mode!', formattedValues);
        // Fallback: try to get from getFieldValue directly (though validateFields should have covered it)
        const rawEmployeeNo = form.getFieldValue('employeeNo');
        if (rawEmployeeNo) {
             formattedValues.employeeNo = rawEmployeeNo;
        }
      }

      console.log('EmployeeModal submitting:', formattedValues);
      await onOk(formattedValues);
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  return (
    <Modal
      title={mode === 'create' ? 'Add Employee' : 'Edit Employee'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {mode === 'create' && (
          <Form.Item
            name="employeeNo"
            label="Employee No"
            rules={[{ required: true, message: 'Please input employee no!' }]}
          >
            <Input placeholder="E.g. E001" />
          </Form.Item>
        )}
        
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input name!' }]}
        >
          <Input placeholder="Employee Name" />
        </Form.Item>

        <Form.Item
          name="deptId"
          label="Department"
          rules={[{ required: true, message: 'Please select department!' }]}
        >
          <Select placeholder="Select Department">
            <Select.Option value={1}>总经办</Select.Option>
            <Select.Option value={3}>研发部-后端组</Select.Option>
            <Select.Option value={4}>研发部-前端组</Select.Option>
            <Select.Option value={5}>人事部</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
          rules={[{ pattern: /^\d+$/, message: 'Valid phone number required' }]}
        >
          <Input placeholder="Phone Number" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', message: 'Valid email required' }]}
        >
          <Input placeholder="Email Address" />
        </Form.Item>

        <Form.Item
          name="hireDate"
          label="Hire Date"
          rules={[{ required: true, message: 'Please select hire date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
