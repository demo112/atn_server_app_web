import React, { useEffect, useState } from 'react';
import { Card, Form, TimePicker, Button, message } from 'antd';
import dayjs from 'dayjs';
import { getSettings, updateSettings } from '../../../services/attendance-settings';
import { logger } from '../../../utils/logger';

const AttendanceSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      form.setFieldsValue({
        day_switch_time: data.day_switch_time ? dayjs(data.day_switch_time, 'HH:mm') : dayjs('05:00', 'HH:mm'),
        auto_calc_time: data.auto_calc_time ? dayjs(data.auto_calc_time, 'HH:mm') : dayjs('04:00', 'HH:mm'),
      });
    } catch (error) {
      logger.error('Failed to fetch settings:', error);
      message.error('加载考勤设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onFinish = async (values: { day_switch_time: dayjs.Dayjs; auto_calc_time: dayjs.Dayjs }) => {
    try {
      setSaving(true);
      await updateSettings({
        day_switch_time: values.day_switch_time.format('HH:mm'),
        auto_calc_time: values.auto_calc_time.format('HH:mm'),
      });
      message.success('保存成功');
    } catch (error) {
      logger.error('Failed to update settings:', error);
      message.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <Card title="考勤制度设置" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="day_switch_time"
            label="考勤日切换时间"
            extra="设置一天的开始时间。例如设置为 05:00，则 05:00 之前的打卡算作前一天。"
            rules={[{ required: true, message: '请选择考勤日切换时间' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="auto_calc_time"
            label="自动计算时间"
            extra="系统每天自动计算前一天考勤结果的时间。建议设置在凌晨，如 04:00。"
            rules={[{ required: true, message: '请选择自动计算时间' }]}
          >
            <TimePicker format="HH:mm" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AttendanceSettingsPage;
