import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/common/ToastProvider';
import dayjs from 'dayjs';
import { getSettings, updateSettings } from '../../../services/attendance-settings';

const AttendanceSettingsPage: React.FC = (): React.ReactElement => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    day_switch_time: '05:00',
    auto_calc_time: '04:00',
  });

  const fetchSettings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getSettings();
      setFormData({
        day_switch_time: data.day_switch_time || '05:00',
        auto_calc_time: data.auto_calc_time || '04:00',
      });
    } catch (error) {
      toast.error('加载考勤设置失败');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings({
        day_switch_time: formData.day_switch_time,
        auto_calc_time: formData.auto_calc_time,
      });
      toast.success('保存成功');
    } catch (error) {
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">考勤制度设置</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            加载中...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 max-w-2xl">
            <div className="space-y-6">
              <div>
                <label htmlFor="day_switch_time" className="block text-sm font-medium text-gray-700 mb-1">
                  考勤日切换时间 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="day_switch_time"
                    name="day_switch_time"
                    value={formData.day_switch_time}
                    onChange={(e) => setFormData({ ...formData, day_switch_time: e.target.value })}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  设置一天的开始时间。例如设置为 05:00，则 05:00 之前的打卡算作前一天。
                </p>
              </div>

              <div>
                <label htmlFor="auto_calc_time" className="block text-sm font-medium text-gray-700 mb-1">
                  自动计算时间 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="time"
                    id="auto_calc_time"
                    name="auto_calc_time"
                    value={formData.auto_calc_time}
                    onChange={(e) => setFormData({ ...formData, auto_calc_time: e.target.value })}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  系统每天自动计算前一天考勤结果的时间。建议设置在凌晨，如 04:00。
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : '保存配置'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AttendanceSettingsPage;
