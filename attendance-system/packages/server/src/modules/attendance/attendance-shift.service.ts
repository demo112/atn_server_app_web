import { prisma as defaultPrisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { CreateShiftDto, UpdateShiftDto, AttShiftVo } from './attendance-shift.dto';
import { PrismaClient } from '@prisma/client';

export class AttendanceShiftService {
  private logger = createLogger('AttendanceShift');

  constructor(private prisma: PrismaClient = defaultPrisma) {}

  /**
   * 创建班次
   */
  async create(data: CreateShiftDto) {
    // 1. 检查名称是否重复
    const existing = await this.prisma.attShift.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw AppError.conflict('Shift name already exists', 'ERR_ATT_SHIFT_NAME_EXISTS');
    }

    // 2. 准备关联数据
    const shiftPeriodsData = this.prepareShiftPeriodsData(data.days);

    // 3. 创建
    const shift = await this.prisma.attShift.create({
      data: {
        name: data.name,
        cycleDays: data.cycleDays ?? 7,
        periods: {
          create: shiftPeriodsData,
        },
      },
      include: {
        periods: {
          include: { period: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    this.logger.info(`Created shift: ${shift.name} (ID: ${shift.id})`);
    return this.formatShift(shift);
  }

  /**
   * 获取列表
   */
  async findAll(name?: string, page: number = 1, pageSize: number = 10) {
    const where = name ? { name: { contains: name } } : {};
    
    const [total, shifts] = await Promise.all([
      this.prisma.attShift.count({ where }),
      this.prisma.attShift.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        // 列表接口不需要返回 periods 详情，保持轻量
      })
    ]);

    const items = shifts.map(shift => ({
      id: shift.id,
      name: shift.name,
      cycleDays: shift.cycleDays,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    }));

    return { items, total };
  }

  /**
   * 获取详情
   */
  async findById(id: number) {
    const shift = await this.prisma.attShift.findUnique({
      where: { id },
      include: {
        periods: {
          include: { period: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!shift) return null;
    return this.formatShift(shift);
  }

  /**
   * 更新班次
   */
  async update(id: number, data: UpdateShiftDto) {
    // 检查是否存在
    const existing = await this.findById(id);
    if (!existing) {
      throw new AppError('ERR_ATT_SHIFT_NOT_FOUND', 'Shift not found', 404);
    }

    // 如果修改了名称，检查重复
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.prisma.attShift.findFirst({
        where: { name: data.name },
      });
      if (nameExists) {
        throw AppError.conflict('Shift name already exists', 'ERR_ATT_SHIFT_NAME_EXISTS');
      }
    }

    // 使用事务处理更新：特别是关联的时间段
    // 如果 days 字段存在，则全量替换 periods
    const updateData: any = {
      name: data.name,
      // cycleDays 不支持更新? 设计文档没说，假设不支持或暂时不更新
    };

    // Prisma 的 update 不支持直接替换关联关系 (deleteMany + create)
    // 需要用事务
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. 更新基本字段
      if (data.name) {
        await tx.attShift.update({
          where: { id },
          data: { name: data.name },
        });
      }

      // 2. 如果提供了 days，重置 periods
      if (data.days) {
        // 删除旧的关联
        await tx.attShiftPeriod.deleteMany({
          where: { shiftId: id },
        });

        // 创建新的关联
        const shiftPeriodsData = this.prepareShiftPeriodsData(data.days);
        if (shiftPeriodsData.length > 0) {
          // 由于 attShiftPeriod 需要 shiftId，但 createMany 不支持直接关联
          // 或者我们可以用 update 的 periods: { create: ... } ?
          // update 也可以用 create，但我们刚刚 deleteMany 了
          // 最简单是 createMany
          await tx.attShiftPeriod.createMany({
            data: shiftPeriodsData.map(p => ({
              ...p,
              shiftId: id,
            })),
          });
        }
      }

      // 3. 返回更新后的完整对象
      return tx.attShift.findUnique({
        where: { id },
        include: {
          periods: {
            include: { period: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });

    if (!result) throw new AppError('ERR_UPDATE_FAILED', 'Update failed', 500); // Should not happen

    this.logger.info(`Updated shift: ${result.name} (ID: ${result.id})`);
    return this.formatShift(result);
  }

  /**
   * 删除班次
   */
  async delete(id: number) {
    // 检查是否存在
    const existing = await this.prisma.attShift.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('ERR_ATT_SHIFT_NOT_FOUND', 'Shift not found', 404);
    }

    // 检查是否被排班引用
    const usageCount = await this.prisma.attSchedule.count({ where: { shiftId: id } });
    if (usageCount > 0) {
      throw AppError.conflict('Shift is in use', 'ERR_ATT_SHIFT_IN_USE');
    }

    await this.prisma.attShift.delete({
      where: { id },
    });

    this.logger.info(`Deleted shift: ${existing.name} (ID: ${existing.id})`);
    return true;
  }

  // --- Helpers ---

  private prepareShiftPeriodsData(days: { dayOfCycle: number; periodIds: number[] }[] | undefined) {
    const result: any[] = [];
    if (!days) return result;

    for (const day of days) {
      if (day.periodIds && day.periodIds.length > 0) {
        day.periodIds.forEach((periodId, index) => {
          result.push({
            periodId,
            dayOfCycle: day.dayOfCycle,
            sortOrder: index,
          });
        });
      }
    }
    return result;
  }

  private formatShift(shift: any): AttShiftVo {
    // Group periods by dayOfCycle
    const daysMap = new Map<number, any[]>();
    
    // 初始化 1-cycleDays? 或者只返回有配置的天?
    // 设计文档显示 "days: [ { dayOfCycle: 1, ... } ]"
    // 我们只返回有配置的天
    
    if (shift.periods) {
      shift.periods.forEach((p: any) => {
        const day = p.dayOfCycle;
        if (!daysMap.has(day)) daysMap.set(day, []);
        // p.period 是 AttTimePeriod 对象
        daysMap.get(day)!.push(p.period);
      });
    }

    const days = [];
    for (const [dayOfCycle, periods] of daysMap.entries()) {
      days.push({ dayOfCycle, periods });
    }
    
    // 按天排序
    days.sort((a, b) => a.dayOfCycle - b.dayOfCycle);

    return {
      id: shift.id,
      name: shift.name,
      cycleDays: shift.cycleDays,
      days,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
    };
  }
}
