import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/user';
import type { UserRole, UserStatus } from '@attendance/shared';

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

  const fetchData = async (currentPage = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await getUsers({ page: currentPage, pageSize: size });
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, pageSize);
  }, [page, pageSize]);

  const handleCreate = () => {
    setModalMode('create');
    setCurrentUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: UserListItem) => {
    setModalMode('edit');
    setCurrentUser(record);
    form.setFieldsValue({
      username: record.username,
      role: record.role,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success('删除成功');
          fetchData(page, pageSize);
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleModalOk = async () => {
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
      // Form validation error or API error
      console.error(error);
    }
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'green'}>{role}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>{status}</Tag>
      ),
    },
    {
      title: '关联人员',
      dataIndex: 'employeeName',
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
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
          onChange: (p, s) => {
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
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled={modalMode === 'edit'} />
          </Form.Item>
          
          {modalMode === 'create' && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="user"
          >
            <Select>
              <Select.Option value="user">普通用户</Select.Option>
              <Select.Option value="admin">管理员</Select.Option>
            </Select>
          </Form.Item>

          {modalMode === 'edit' && (
             <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Select.Option value="active">启用</Select.Option>
                <Select.Option value="inactive">禁用</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;
