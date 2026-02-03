import React, { useState, useEffect } from 'react';
import { Modal, Select, message } from 'antd';
import { userService } from '../../../services/user';

interface BindUserModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (userId: number | null) => Promise<void>;
  confirmLoading?: boolean;
}

export const BindUserModal: React.FC<BindUserModalProps> = ({
  open,
  onCancel,
  onOk,
  confirmLoading,
}) => {
  const [users, setUsers] = useState<{ label: string; value: number }[]>([]);
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (keyword = ''): Promise<void> => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ page: 1, pageSize: 20, keyword });
      const options = res.items
        .filter((u: any) => !u.employeeName) // Only show unbound users
        .map((u: any) => ({
          label: u.username,
          value: u.id,
        }));
      setUsers(options);
    } catch {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      setValue(null);
    }
  }, [open]);

  const handleOk = (): void => {
    onOk(value);
  };

  return (
    <Modal
      title="Bind User Account"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      destroyOnHidden
    >
      <p>Select a user account to bind to this employee:</p>
      <Select
        showSearch
        style={{ width: '100%' }}
        placeholder="Select a user"
        filterOption={false}
        onSearch={(val) => fetchUsers(val)}
        onChange={setValue}
        value={value}
        loading={loading}
        options={users}
        allowClear
      />
      <div style={{ marginTop: 8, color: '#888', fontSize: '12px' }}>
        * Only users not bound to other employees are shown.
      </div>
    </Modal>
  );
};
