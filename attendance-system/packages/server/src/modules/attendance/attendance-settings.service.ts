import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AttendanceSettings, UpdateSettingsDto } from './attendance-settings.dto';

export class AttendanceSettingsService {
  private logger = createLogger('AttendanceSettings');

  /**
   * 初始化默认配置
   */
  async initDefaults() {
    console.log(`[${new Date().toISOString()}] [INFO] [AttendanceSettings] System - Initializing defaults`);
    const defaultSettings = [
      { key: 'day_switch_time', value: '05:00', description: '考勤日切换时间' },
    ];

    for (const setting of defaultSettings) {
      const exists = await prisma.attSetting.findUnique({
        where: { key: setting.key },
      });

      if (!exists) {
        await prisma.attSetting.create({
          data: setting,
        });
        console.log(`[${new Date().toISOString()}] [INFO] [AttendanceSettings] System - Initialized default setting: ${setting.key}`);
      }
    }
  }

  /**
   * 获取所有考勤设置
   */
  async getSettings(): Promise<AttendanceSettings> {
    const settings = await prisma.attSetting.findMany();
    
    // 转换为键值对对象
    const result: any = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    // 确保包含必要字段（兜底）
    if (!result.day_switch_time) {
      result.day_switch_time = '05:00';
    }

    return result as AttendanceSettings;
  }

  /**
   * 更新考勤设置
   */
  async updateSettings(dto: UpdateSettingsDto): Promise<AttendanceSettings> {
    this.logger.info({ dto }, 'System - Updating settings');
    // 目前只支持更新 day_switch_time，后续可扩展
    if (dto.day_switch_time) {
      // 简单的格式校验
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(dto.day_switch_time)) {
        throw new Error('INVALID_TIME_FORMAT');
      }

      await prisma.attSetting.upsert({
        where: { key: 'day_switch_time' },
        update: { value: dto.day_switch_time },
        create: {
          key: 'day_switch_time',
          value: dto.day_switch_time,
          description: '考勤日切换时间',
        },
      });
    }

    return this.getSettings();
  }
}

export const attendanceSettingsService = new AttendanceSettingsService();
