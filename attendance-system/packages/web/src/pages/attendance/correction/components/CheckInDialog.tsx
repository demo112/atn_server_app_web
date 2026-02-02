import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, message } from 'antd';
import * as correctionService from '@/services/correction';
import dayjs from 'dayjs';

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dailyRecordId: string;
  employeeName?: string;
  workDate?: string;
}

export const CheckInDialog: React.FC<CheckInDialogProps> = ({ 
  isOpen, onClose, onSuccess, dailyRecordId, employeeName, workDate 
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        checkInTime: dayjs(),
        remark: ''
      });
    }
  }, [isOpen, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await correctionService.supplementCheckIn({
        dailyRecordId,
        checkInTime: values.checkInTime.toISOString(),
        remark: values.remark
      });
      
      message.success('补签到成功');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      message.error(err.message || '补签失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="补签到"
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      {employeeName && (
        <div style={{ marginBottom: 16, color: '#666' }}>
          员工: {employeeName} | 日期: {workDate}
        </div>
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          name="checkInTime"
          label="签到时间"
          rules={[{ required: true, message: '请选择签到时间' }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={3} placeholder="请输入补签原因..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
