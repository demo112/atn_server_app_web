import { prisma } from '../../common/db/prisma';
import { CreateClockDto, ClockQueryDto, AttClockRecordVo } from './attendance-clock.dto';
import { Prisma } from '@prisma/client';

export class AttendanceClockService {
  
  /**
   * 将 Prisma 原始记录转换为 VO (处理 BigInt)
   */
  private mapToVo(record: any): AttClockRecordVo {
    return {
      id: record.id.toString(),
      employeeId: record.employeeId,
      clockTime: record.clockTime,
      type: record.type,
      source: record.source,
      deviceInfo: record.deviceInfo,
      location: record.location,
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
    // 检查员工是否存在
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId }
    });
    if (!employee) {
      throw new Error('ERR_EMPLOYEE_NOT_FOUND');
    }

    // 创建记录
    const record = await prisma.attClockRecord.create({
      data: {
        employeeId: data.employeeId,
        clockTime: data.clockTime ? new Date(data.clockTime) : new Date(),
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

    console.log(`[${new Date().toISOString()}] [INFO] [AttendanceClock] Created clock record: Emp ${record.employeeId} Type ${record.type} (ID: ${record.id})`);
    return this.mapToVo(record);
  }

  /**
   * 查询打卡记录列表
   */
  async findAll(query: ClockQueryDto) {
    const { page = 1, pageSize = 20, employeeId, deptId, startTime, endTime, type, source } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    if (employeeId) where.employeeId = employeeId;
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
      where.employee = { deptId };
    }

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
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      }
    };
  }
}
