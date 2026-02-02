
import { prisma } from '../../../common/db/prisma';
import { CreateTimePeriodReqDto, UpdateTimePeriodReqDto } from './time-period.dto';
import { TimePeriod } from '@attendance/shared';

export class TimePeriodService {
  /**
   * 创建时间段
   */
  async create(data: CreateTimePeriodReqDto): Promise<TimePeriod> {
    // 1. 检查名称是否重复
    const existing = await prisma.attTimePeriod.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('ERR_ATT_PERIOD_NAME_EXISTS');
    }

    // 2. 验证规则 (业务逻辑验证)
    if (data.type === 1 && !data.rules) {
      // 弹性班制建议有规则，但不强制
      console.warn(`[WARN] Creating flexible time period ${data.name} without rules`);
    }

    // 3. 创建
    const period = await prisma.attTimePeriod.create({
      data: {
        name: data.name,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        restStartTime: data.restStartTime,
        restEndTime: data.restEndTime,
        rules: data.rules ? JSON.parse(JSON.stringify(data.rules)) : undefined,
      },
    });

    console.log(`[${new Date().toISOString()}] [INFO] [TimePeriod] Created: ${period.name} (ID: ${period.id})`);
    
    return this.mapToVo(period);
  }

  /**
   * 获取列表
   */
  async findAll() {
    const periods = await prisma.attTimePeriod.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return periods.map(this.mapToVo);
  }

  /**
   * 获取详情
   */
  async findById(id: number): Promise<TimePeriod | null> {
    const period = await prisma.attTimePeriod.findUnique({
      where: { id },
    });
    return period ? this.mapToVo(period) : null;
  }

  /**
   * 更新时间段
   */
  async update(id: number, data: UpdateTimePeriodReqDto): Promise<TimePeriod> {
    // 检查是否存在
    const existing = await prisma.attTimePeriod.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('ERR_ATT_PERIOD_NOT_FOUND');
    }

    // 如果修改了名称，检查重复
    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.attTimePeriod.findFirst({
        where: { name: data.name },
      });
      if (nameExists) {
        throw new Error('ERR_ATT_PERIOD_NAME_EXISTS');
      }
    }

    const updated = await prisma.attTimePeriod.update({
      where: { id },
      data: {
        ...data,
        rules: data.rules ? JSON.parse(JSON.stringify(data.rules)) : undefined,
      },
    });

    console.log(`[${new Date().toISOString()}] [INFO] [TimePeriod] Updated: ${updated.name} (ID: ${updated.id})`);
    return this.mapToVo(updated);
  }

  /**
   * 删除时间段
   */
  async remove(id: number): Promise<void> {
    // 检查是否存在
    const existing = await prisma.attTimePeriod.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('ERR_ATT_PERIOD_NOT_FOUND');
    }

    // 检查是否被班次引用
    const shiftCount = await prisma.attShiftPeriod.count({
      where: { periodId: id },
    });

    if (shiftCount > 0) {
      throw new Error('ERR_ATT_PERIOD_IN_USE');
    }

    await prisma.attTimePeriod.delete({ where: { id } });
    console.log(`[${new Date().toISOString()}] [INFO] [TimePeriod] Deleted: ${existing.name} (ID: ${id})`);
  }

  /**
   * 映射数据库模型到 VO
   */
  private mapToVo(entity: any): TimePeriod {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      startTime: entity.startTime,
      endTime: entity.endTime,
      restStartTime: entity.restStartTime,
      restEndTime: entity.restEndTime,
      rules: entity.rules as any, // Json type handling
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
