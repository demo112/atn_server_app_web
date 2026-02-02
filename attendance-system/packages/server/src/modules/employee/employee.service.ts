import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';
import { EmployeeStatus } from '@prisma/client';
import { 
  CreateEmployeeInput, 
  UpdateEmployeeInput, 
  GetEmployeesInput, 
  BindUserInput 
} from './employee.dto';

export class EmployeeService {
  async create(dto: CreateEmployeeInput) {
    const existing = await prisma.employee.findUnique({ 
      where: { employeeNo: dto.employeeNo } 
    });
    if (existing) {
      throw AppError.conflict('Employee No already exists', 'ERR_EMPLOYEE_EXISTS');
    }

    const employee = await prisma.employee.create({
      data: {
        ...dto,
        status: EmployeeStatus.active,
      },
    });

    return employee;
  }

  async findAll(query: GetEmployeesInput) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      status: EmployeeStatus.active, // 默认只查 active
    };

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { employeeNo: { contains: query.keyword } },
        { phone: { contains: query.keyword } },
      ];
    }
    
    if (query.deptId) {
      where.deptId = query.deptId;
    }

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: pageSize,
        include: { 
          department: true,
          user: true, 
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return {
      items: items.map(e => ({
        id: e.id,
        employeeNo: e.employeeNo,
        name: e.name,
        phone: e.phone,
        email: e.email,
        deptId: e.deptId,
        deptName: e.department?.name,
        status: e.status,
        hireDate: e.hireDate?.toISOString().split('T')[0],
        userId: e.user?.id,
        username: e.user?.username,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { 
        department: true,
        user: true, 
      },
    });

    if (!employee || employee.status === EmployeeStatus.deleted) {
      throw AppError.notFound('Employee');
    }

    return {
      id: employee.id,
      employeeNo: employee.employeeNo,
      name: employee.name,
      phone: employee.phone,
      email: employee.email,
      deptId: employee.deptId,
      deptName: employee.department?.name,
      status: employee.status,
      hireDate: employee.hireDate?.toISOString().split('T')[0],
      userId: employee.user?.id,
      username: employee.user?.username,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    };
  }

  async update(id: number, dto: UpdateEmployeeInput) {
    // Check existence
    await this.findOne(id);

    const employee = await prisma.employee.update({
      where: { id },
      data: dto,
    });

    return employee;
  }

  async delete(id: number) {
    const employee = await this.findOne(id);
    
    // Soft delete logic
    const timestamp = new Date().getTime();
    const newEmployeeNo = `del_${timestamp}_${employee.employeeNo}`;

    // Transaction: Update employee status/no AND disconnect user
    await prisma.$transaction([
      prisma.employee.update({
        where: { id },
        data: {
          status: EmployeeStatus.deleted,
          employeeNo: newEmployeeNo,
        },
      }),
      // 如果有关联用户，解绑 (通过将 User.employeeId 设为 null)
      ...(employee.userId ? [
        prisma.user.update({
          where: { id: employee.userId },
          data: { employeeId: null },
        })
      ] : [])
    ]);

    return { success: true };
  }

  async bindUser(id: number, dto: BindUserInput) {
    const employee = await this.findOne(id);

    // 如果要解绑
    if (dto.userId === null) {
        if (employee.userId) {
            await prisma.user.update({
                where: { id: employee.userId },
                data: { employeeId: null }
            });
        }
        return { success: true };
    }

    // 如果要绑定
    // 1. 检查 User 是否存在且未绑定其他员工
    const user = await prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
        throw AppError.notFound('User');
    }
    if (user.employeeId && user.employeeId !== id) {
        throw AppError.conflict('User already bound to another employee', 'ERR_USER_BOUND');
    }

    // 2. 检查 Employee 是否已绑定其他用户
    if (employee.userId && employee.userId !== dto.userId) {
        throw AppError.conflict('Employee already bound to another user', 'ERR_EMPLOYEE_BOUND');
    }

    // 3. 绑定
    await prisma.user.update({
        where: { id: dto.userId },
        data: { employeeId: id }
    });

    return { success: true };
  }
}

export const employeeService = new EmployeeService();
