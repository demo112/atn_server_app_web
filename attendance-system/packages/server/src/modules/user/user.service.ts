import bcrypt from 'bcryptjs';
import { prisma } from '../../common/db/prisma';
import { UserListVo, UserRole } from '@attendance/shared';
import { CreateUserInput, UpdateUserInput, GetUsersInput } from './user.dto';
import { AppError } from '../../common/errors';
import { createLogger } from '../../common/logger';

const logger = createLogger('user-service');

export class UserService {
  async create(dto: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) {
      throw AppError.conflict('Username already exists');
    }

    const password = dto.password || '123456'; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Auto create and link employee when not provided, using nested create to avoid extra transaction
      const hasEmployeeId = typeof dto.employeeId === 'number' && Number.isFinite(dto.employeeId);
      const user = await prisma.user.create({
        data: {
          username: dto.username,
          passwordHash: hashedPassword,
          role: dto.role as any,
          status: 'active',
          ...(hasEmployeeId
            ? { employeeId: dto.employeeId as number }
            : {
                employee: {
                  create: {
                    employeeNo: `U${Date.now()}`,
                    name: dto.username,
                    hireDate: new Date(),
                  },
                },
              }),
        },
      });

      logger.info({ userId: user?.id, employeeId: user?.employeeId }, 'User created');

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
        employeeId: user.employeeId,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('employeeId')) {
        logger.warn({ err: error, dto }, 'Employee already linked to a user');
        throw AppError.conflict('Employee is already linked to a user');
      }
      logger.error({ err: error, dto }, 'Failed to create user');
      throw error;
    }
  }

  async findAll(query: GetUsersInput): Promise<UserListVo> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.keyword) {
      where.OR = [
        { username: { contains: query.keyword } },
        // { employee: { name: { contains: query.keyword } } }, // Relation check needed
      ];
    }
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: items.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role as UserRole,
        status: u.status as any,
        employeeName: u.employee?.name,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
    };
  }

  async findOne(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!user) throw AppError.notFound('User');
    return {
        id: user.id,
        username: user.username,
        role: user.role as UserRole,
        status: user.status as any,
        employeeId: user.employeeId,
        employeeName: user.employee?.name,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
  }

  async update(id: number, dto: UpdateUserInput) {
    const data: any = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 10);
      delete data.password;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });
    
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      employeeId: user.employeeId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}

export const userService = new UserService();
