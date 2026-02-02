import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Modal, message, Form, Tag } from 'antd';
import { EmployeeVo, CreateEmployeeDto, UpdateEmployeeDto } from '@attendance/shared';
import { employeeService } from '../../services/employee';
import { EmployeeModal } from './components/EmployeeModal';
import { BindUserModal } from './components/BindUserModal';

const EmployeeList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmployeeVo[]>([]);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({ page: 1, pageSize: 10, keyword: '' });
  const [form] = Form.useForm();

  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeModalMode, setEmployeeModalMode] = useState<'create' | 'edit'>('create');
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeVo | null>(null);
  
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [bindEmployeeId, setBindEmployeeId] = useState<number | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getEmployees(params);
      setData(res.items);
      setTotal(res.total);
    } catch (error) {
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [params]);

  // Handlers
  const handleAdd = () => {
    setEmployeeModalMode('create');
    setCurrentEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEdit = (record: EmployeeVo) => {
    setEmployeeModalMode('edit');
    setCurrentEmployee(record);
    setIsEmployeeModalOpen(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Are you sure to delete this employee?',
      content: 'This action will soft delete the employee.',
      onOk: async () => {
        try {
          await employeeService.deleteEmployee(id);
          message.success('Deleted successfully');
          fetchEmployees();
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
  };

  const handleEmployeeModalOk = async (values: CreateEmployeeDto | UpdateEmployeeDto) => {
    try {
      if (employeeModalMode === 'create') {
        await employeeService.createEmployee(values as CreateEmployeeDto);
        message.success('Employee created successfully');
      } else {
        if (!currentEmployee) return;
        await employeeService.updateEmployee(currentEmployee.id, values as UpdateEmployeeDto);
        message.success('Employee updated successfully');
      }
      setIsEmployeeModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
        // Error handling (e.g. duplication)
        message.error(error.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleBindClick = (record: EmployeeVo) => {
    setBindEmployeeId(record.id);
    setIsBindModalOpen(true);
  };

  const handleUnbindClick = (record: EmployeeVo) => {
    Modal.confirm({
      title: 'Unbind User',
      content: `Unbind user ${record.username}?`,
      onOk: async () => {
        try {
          await employeeService.bindUser(record.id, { userId: null });
          message.success('Unbound successfully');
          fetchEmployees();
        } catch (error) {
          message.error('Failed to unbind');
        }
      },
    });
  };

  const handleBindModalOk = async (userId: number | null) => {
    if (!bindEmployeeId) return;
    try {
      await employeeService.bindUser(bindEmployeeId, { userId });
      message.success('Bound successfully');
      setIsBindModalOpen(false);
      fetchEmployees();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to bind');
    }
  };

  const columns = [
    { title: 'Employee No', dataIndex: 'employeeNo', key: 'employeeNo' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Department', dataIndex: 'deptName', key: 'deptName' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
      )
    },
    {
      title: 'Linked User',
      key: 'user',
      render: (_: any, record: EmployeeVo) => (
        record.username ? (
          <Space>
            <Tag color="blue">{record.username}</Tag>
            <Button type="link" size="small" onClick={() => handleUnbindClick(record)}>Unbind</Button>
          </Space>
        ) : (
          <Button type="link" size="small" onClick={() => handleBindClick(record)}>Bind User</Button>
        )
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: EmployeeVo) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (values: any) => {
    setParams({ ...params, page: 1, keyword: values.keyword || '' });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input.Search placeholder="Search by name/no" onSearch={() => form.submit()} />
          </Form.Item>
        </Form>
        <Button type="primary" onClick={handleAdd}>Add Employee</Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total: total,
          onChange: (page, pageSize) => setParams({ ...params, page, pageSize }),
        }}
      />

      <EmployeeModal
        open={isEmployeeModalOpen}
        mode={employeeModalMode}
        initialValues={currentEmployee}
        onCancel={() => setIsEmployeeModalOpen(false)}
        onOk={handleEmployeeModalOk}
      />

      <BindUserModal
        open={isBindModalOpen}
        onCancel={() => setIsBindModalOpen(false)}
        onOk={handleBindModalOk}
      />
    </div>
  );
};

export default EmployeeList;
