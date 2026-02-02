import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings, AttendanceSettings } from '../../../services/attendance-settings';

const AttendanceSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AttendanceSettings>({
    day_switch_time: '05:00',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      alert('加载考勤设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings({
        day_switch_time: settings.day_switch_time,
      });
      alert('保存成功');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">考勤制度设置</h1>
      </div>

      <div className="bg-white p-6 rounded shadow max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              考勤日切换时间
            </label>
            <p className="text-sm text-gray-500 mb-2">
              设置一天的开始时间。例如设置为 05:00，则 05:00 之前的打卡算作前一天。
            </p>
            <input
              type="time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={settings.day_switch_time}
              onChange={(e) =>
                setSettings({ ...settings, day_switch_time: e.target.value })
              }
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceSettingsPage;
