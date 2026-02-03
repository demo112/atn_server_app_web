
import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, TreeSelect, message } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import { DepartmentVO, CreateDepartmentDto, UpdateDepartmentDto } from '@attendance/shared';
import { departmentService } from '../../../services/department';
import { logger } from '../../../utils/logger';

interface DepartmentFormProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<DepartmentVO>; // For edit or create with parentId
  treeData: DepartmentVO[]; // For parent selection
  onCancel: () => void;
  onSuccess: () => void;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  visible,
  mode,
  initialValues,
  treeData,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          parentId: initialValues.parentId,
          sortOrder: initialValues.sortOrder,
        });
      } else {
        form.resetFields();
        if (initialValues?.parentId) {
          form.setFieldsValue({ parentId: initialValues.parentId });
        }
      }
    }
  }, [visible, mode, initialValues, form]);

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (mode === 'create') {
        const dto: CreateDepartmentDto = {
          name: values.name,
          parentId: values.parentId || null,
          sortOrder: values.sortOrder || 0,
        };
        const res = await departmentService.createDepartment(dto);
        if (res.success) {
          message.success('创建成功');
          onSuccess();
        }
      } else {
        if (!initialValues?.id) return;
        const dto: UpdateDepartmentDto = {
          name: values.name,
          parentId: values.parentId || null,
          sortOrder: values.sortOrder,
        };
        const res = await departmentService.updateDepartment(initialValues.id, dto);
        if (res.success) {
          message.success('更新成功');
          onSuccess();
        }
      }
    } catch (error) {
      logger.error('Operation failed', error);
      // message.error('操作失败'); // Service layer or request util might handle generic errors
    } finally {
      setSubmitting(false);
    }
  };

  // 转换 TreeData 供 TreeSelect 使用
  const renderTreeSelectData = (nodes: DepartmentVO[]): DefaultOptionType[] => {
    return nodes.map(node => ({
      label: node.name,
      value: node.id,
      children: node.children ? renderTreeSelectData(node.children) : [],
      disabled: mode === 'edit' && node.id === initialValues?.id, // 编辑时不能选自己（后端还会校验子孙）
    }));
  };

  return (
    <Modal
      title={mode === 'create' ? '新建部门' : '编辑部门'}
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ sortOrder: 0 }}
      >
        <Form.Item
          name="name"
          label="部门名称"
          rules={[{ required: true, message: '请输入部门名称' }]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>

        <Form.Item
          name="parentId"
          label="上级部门"
          extra="不选则作为根部门"
        >
          <TreeSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            treeData={renderTreeSelectData(treeData) as any}
            placeholder="请选择上级部门"
            allowClear
            treeDefaultExpandAll
          />
        </Form.Item>

        <Form.Item
          name="sortOrder"
          label="排序值"
          extra="数值越小越靠前"
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
