import { prisma } from '../../common/db/prisma';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';
import { CreateClockDto, ClockQueryDto, AttClockRecordVo } from './attendance-clock.dto';
import { Prisma } from '@prisma/client';
import invariant from 'tiny-invariant';

export class AttendanceClockService {
  private logger = createLogger('AttendanceClock');
  
  /**
   * 将 Prisma 原始记录转换为 VO (处理 BigInt)
   */
  private mapToVo(record: Prisma.AttClockRecordGetPayload<{
    include: {
      employee: { include: { department: true } },
      operator: true
    }
  }>): AttClockRecordVo {
    return {
      id: record.id.toString(),
      employeeId: record.employeeId,
      clockTime: record.clockTime,
      type: record.type,
      source: record.source,
      deviceInfo: record.deviceInfo as any, // Json type
      location: record.location as any, // Json type
      operatorId: record.operatorId,
      remark: record.remark,
      createdAt: record.createdAt,
      
      // 关联信息
      employeeName: record.employee?.name,
      deptName: record.employee?.department?.name,
      operatorName: record.operator?.username,
    };
  }

  /**
   * 创建打卡记录
   */
  async create(data: CreateClockDto) {
    // 维度2: Consistency - 前置条件断言
    if (data.employeeId <= 0) {
      throw new AppError('ERR_EMPLOYEE_NOT_FOUND', 'Employee not found', 404);
    }
    invariant(data.type, 'Clock type is required');
    invariant(data.source, 'Clock source is required');

    return prisma.$transaction(async (tx) => {
      // 0. 并发控制: 锁定员工记录，防止毫秒级并发打卡
      // 使用 SELECT ... FOR UPDATE 序列化同一员工的请求
      await tx.$queryRaw`SELECT 1 FROM employees WHERE id = ${data.employeeId} FOR UPDATE`;

      const clockTime = data.clockTime ? new Date(data.clockTime) : new Date();
      const now = new Date();

      // 1. 禁止未来时间打卡 (允许 1 分钟容错)
      if (clockTime.getTime() > now.getTime() + 60 * 1000) {
        throw new AppError('ERR_CLOCK_FUTURE_TIME_NOT_ALLOWED', 'Future clock time not allowed', 400);
      }

      // 2. 处理重复打卡 (1 分钟内禁止重复)
      const lastClock = await tx.attClockRecord.findFirst({
        where: {
          employeeId: data.employeeId,
          clockTime: {
            gte: new Date(clockTime.getTime() - 60 * 1000),
            lte: clockTime
          }
        },
        orderBy: { clockTime: 'desc' }
      });

      if (lastClock) {
        throw new AppError('ERR_CLOCK_TOO_FREQUENT', 'Clock in too frequent', 400);
      }

      // 检查员工是否存在
      const employee = await tx.employee.findUnique({
        where: { id: data.employeeId }
      });
      if (!employee) {
        throw new AppError('ERR_EMPLOYEE_NOT_FOUND', 'Employee not found', 404);
      }

      // 创建记录
      const record = await tx.attClockRecord.create({
        data: {
          employeeId: data.employeeId,
          clockTime: clockTime,
          type: data.type,
          source: data.source,
          deviceInfo: data.deviceInfo ?? Prisma.JsonNull,
          location: data.location ?? Prisma.JsonNull,
          operatorId: data.operatorId,
          remark: data.remark,
        },
        include: {
          employee: {
            include: { department: true }
          },
          operator: true
        }
      });

      this.logger.info(`Created clock record: Emp ${record.employeeId} Type ${record.type} (ID: ${record.id})`);
      return this.mapToVo(record);
    });
  }

  /**
   * 查询打卡记录列表
   */
  async findAll(query: ClockQueryDto) {
    const { page = 1, pageSize = 20, employeeId, deptId, startTime, endTime, type, source } = query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const where: any = {};
    
    if (employeeId) where.employeeId = Number(employeeId);
    if (type) where.type = type;
    if (source) where.source = source;
    
    // 时间范围查询
    if (startTime || endTime) {
      where.clockTime = {};
      if (startTime) where.clockTime.gte = new Date(startTime);
      if (endTime) where.clockTime.lte = new Date(endTime);
    }
    
    // 部门查询 (通过关联)
    if (deptId) {
      where.employee = { deptId: Number(deptId) };
    }

    this.logger.info({ query, where, skip, take: Number(pageSize) }, 'findAll query');

    const [total, items] = await Promise.all([
      prisma.attClockRecord.count({ where }),
      prisma.attClockRecord.findMany({
        where,
        skip,
        take: Number(pageSize),
        orderBy: { clockTime: 'desc' },
        include: {
          employee: {
            include: { department: true } // 获取部门名称
          },
          operator: true // 获取操作人名称
        }
      })
    ]);

    return {
      items: items.map(item => this.mapToVo(item)),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / Number(pageSize))
    };
  }
}
