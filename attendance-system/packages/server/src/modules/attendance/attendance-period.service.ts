import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { CreateTimePeriodDto, UpdateTimePeriodDto } from './attendance-period.dto';

export class AttendancePeriodService {
  private logger = createLogger('AttendancePeriod');

  /**
   * 创建时间段
   */
  async create(data: CreateTimePeriodDto) {
    // 1. 检查名称是否重复
    const existing = await prisma.attTimePeriod.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw AppError.conflict('Time period name already exists', 'ERR_ATT_PERIOD_NAME_EXISTS');
    }

    // 2. 验证时间格式 (简单的正则验证可以在 Controller 层做，这里做业务逻辑验证)
    // 验证 startTime < endTime 或者是跨天? 目前假设不跨天或由前端保证逻辑，
    // 但后端最好也防一下。这里先做基础创建。

    // 3. 创建
    const period = await prisma.attTimePeriod.create({
      data: {
        name: data.name,
        type: data.type,
        startTime: data.startTime,
        endTime: data.endTime,
        restStartTime: data.restStartTime,
        restEndTime: data.restEndTime,
        rules: data.rules ?? {},
      },
    });

    this.logger.info(`Created time period: ${period.name} (ID: ${period.id})`);
    return period;
  }

  /**
   * 获取列表
   */
  async findAll() {
    return prisma.attTimePeriod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取详情
   */
  async findById(id: number) {
    return prisma.attTimePeriod.findUnique({
      where: { id },
    });
  }

  /**
   * 更新时间段
   */
  async update(id: number, data: UpdateTimePeriodDto) {
    // 检查是否存在
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError('ERR_ATT_PERIOD_NOT_FOUND', 'Time period not found', 404);
    }

    // 如果修改了名称，检查重复
    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.attTimePeriod.findFirst({
        where: { name: data.name },
      });
      if (nameExists) {
        throw AppError.conflict('Time period name already exists', 'ERR_ATT_PERIOD_NAME_EXISTS');
      }
    }

    const updated = await prisma.attTimePeriod.update({
      where: { id },
      data: {
        ...data,
        rules: data.rules ?? undefined, // 如果传入 null/undefined 则不更新
      },
    });

    this.logger.info(`Updated time period: ${updated.name} (ID: ${updated.id})`);
    return updated;
  }

  /**
   * 删除时间段
   */
  async delete(id: number) {
    // 检查是否存在
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError('ERR_ATT_PERIOD_NOT_FOUND', 'Time period not found', 404);
    }

    // TODO: 检查是否被班次引用 (AttShiftPeriod)
    // const usageCount = await prisma.attShiftPeriod.count({ where: { timePeriodId: id } });
    // if (usageCount > 0) throw AppError.conflict('Time period in use', 'ERR_ATT_PERIOD_IN_USE');

    await prisma.attTimePeriod.delete({
      where: { id },
    });

    this.logger.info(`Deleted time period: ${existing.name} (ID: ${existing.id})`);
    return true;
  }
}
