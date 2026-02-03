import React, { useEffect, useState } from 'react';
// UserList component
import { Table, Button, Space, Tag, Modal, Form, Input as AntdInput, Select as AntdSelect, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/user';
import type { UserRole, UserStatus } from '@attendance/shared';
import { fixAntd } from '../../utils/type-helpers';

// Workaround for Antd v5 + React 18 type incompatibility
const Select = fixAntd(AntdSelect);
const FormItem = fixAntd(Form.Item);
const Input = fixAntd(AntdInput);

interface UserListItem {
  id: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  employeeName?: string;
  createdAt: string;
}

const UserList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentUser, setCurrentUser] = useState<UserListItem | null>(null);
  const [form] = Form.useForm();

  const fetchData = async (currentPage = 1, size = 10): Promise<void> => {
    setLoading(true);
    try {
      const res = await getUsers({ page: currentPage, pageSize: size });
      setData(res.items);
      setTotal(res.total);
    } catch {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize]);

  const handleCreate = (): void => {
    setModalMode('create');
    setCurrentUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: UserListItem): void => {
    setModalMode('edit');
    setCurrentUser(record);
    form.setFieldsValue({
      username: record.username,
      role: record.role,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number): Promise<void> => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success('删除成功');
          fetchData(page, pageSize);
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  const handleModalOk = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'create') {
        await createUser(values);
        message.success('创建成功');
      } else {
        if (!currentUser) return;
        await updateUser(currentUser.id, values);
        message.success('更新成功');
      }
      setIsModalOpen(false);
      fetchData(page, pageSize);
    } catch (error) {
      console.error(error);
      // Form validation error or API error
    }
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: '关联员工',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: UserListItem) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>用户管理</h2>
        <Button type="primary" onClick={handleCreate}>新增用户</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (p: number, s: number) => {
            setPage(p);
            setPageSize(s);
          },
        }}
      />

      <Modal
        title={modalMode === 'create' ? '新增用户' : '编辑用户'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
        >
          <FormItem
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </FormItem>

          <FormItem
            name="password"
            label="密码"
            rules={[{ required: modalMode === 'create', message: '请输入密码' }]}
          >
            <Input.Password placeholder={modalMode === 'edit' ? '留空不修改' : '请输入密码'} />
          </FormItem>

          <FormItem
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="manager">部门经理</Select.Option>
            </Select>
          </FormItem>

          <FormItem
            name="status"
            label="状态"
            initialValue="active"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
