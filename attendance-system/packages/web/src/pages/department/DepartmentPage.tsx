
import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Card, message, Button, Space, Typography, Descriptions, Modal } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { DepartmentTree } from './components/DepartmentTree';
import { DepartmentForm } from './components/DepartmentForm';
import { departmentService } from '../../services/department';
import { DepartmentVO } from '@attendance/shared';

const { Sider, Content } = Layout;
const { Title } = Typography;

const DepartmentPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<DepartmentVO[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentVO | null>(null);

  // Form State
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formInitialValues, setFormInitialValues] = useState<Partial<DepartmentVO> | undefined>(undefined);

  const fetchTree = useCallback(async () => {
    try {
      setLoading(true);
      const res = await departmentService.getTree();
      if (res.success) {
        setTreeData(res.data);
      }
    } catch (error) {
      message.error('获取部门树失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartment = async (id: number) => {
    try {
      const res = await departmentService.getDepartment(id);
      if (res.success) {
        setSelectedDepartment(res.data);
      }
    } catch (error) {
      console.error(error);
      message.error('获取部门详情失败');
    }
  };

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleSelect = (keys: React.Key[], info: any) => {
    setSelectedKeys(keys);
    if (keys.length > 0) {
      fetchDepartment(Number(keys[0]));
    } else {
      setSelectedDepartment(null);
    }
  };

  const handleCreate = () => {
    setFormMode('create');
    setFormInitialValues({ parentId: selectedDepartment?.id || undefined }); // 默认选中当前部门为父部门
    setFormVisible(true);
  };

  const handleEdit = () => {
    if (!selectedDepartment) return;
    setFormMode('edit');
    setFormInitialValues(selectedDepartment);
    setFormVisible(true);
  };

  const handleDelete = () => {
    if (!selectedDepartment) return;
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除部门 "${selectedDepartment.name}" 吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await departmentService.deleteDepartment(selectedDepartment.id);
          if (res.success) {
            message.success('删除成功');
            setSelectedDepartment(null);
            setSelectedKeys([]);
            fetchTree();
          }
        } catch (error) {
          console.error(error);
          // message.error('删除失败'); // generic handled in request util?
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    fetchTree();
    // 如果是编辑当前选中节点，刷新详情
    if (formMode === 'edit' && selectedDepartment) {
      fetchDepartment(selectedDepartment.id);
    }
  };

  return (
    <Layout style={{ height: '100%', background: '#fff' }}>
      <Sider width={300} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={5} style={{ margin: 0 }}>组织架构</Title>
          <Space>
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={fetchTree} 
              loading={loading}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="small"
              onClick={handleCreate}
            >
              新增
            </Button>
          </Space>
        </div>
        <div style={{ overflow: 'auto', height: 'calc(100% - 65px)' }}>
          <DepartmentTree 
            loading={loading}
            treeData={treeData}
            onSelect={handleSelect}
            selectedKeys={selectedKeys}
          />
        </div>
      </Sider>
      <Content style={{ padding: '24px' }}>
        {selectedDepartment ? (
          <Card 
            title={selectedDepartment.name} 
            bordered={false}
            extra={
              <Space>
                <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
                <Button icon={<DeleteOutlined />} danger onClick={handleDelete}>删除</Button>
              </Space>
            }
          >
            <Descriptions column={1}>
              <Descriptions.Item label="部门ID">{selectedDepartment.id}</Descriptions.Item>
              <Descriptions.Item label="部门名称">{selectedDepartment.name}</Descriptions.Item>
              <Descriptions.Item label="上级部门ID">{selectedDepartment.parentId || '无 (根部门)'}</Descriptions.Item>
              <Descriptions.Item label="排序值">{selectedDepartment.sortOrder}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(selectedDepartment.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{new Date(selectedDepartment.updatedAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
          </Card>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#999' }}>
            请选择左侧部门查看详情
          </div>
        )}

        <DepartmentForm
          visible={formVisible}
          mode={formMode}
          initialValues={formInitialValues}
          treeData={treeData}
          onCancel={() => setFormVisible(false)}
          onSuccess={handleFormSuccess}
        />
      </Content>
    </Layout>
  );
};

export default DepartmentPage;
