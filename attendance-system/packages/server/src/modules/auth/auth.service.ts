import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../common/db/prisma';
import { LoginDto, LoginVo, MeVo, UserRole } from '@attendance/shared';
import { createLogger } from '../../common/logger';
import { AppError } from '../../common/errors';

const logger = createLogger('auth');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  async login(dto: LoginDto): Promise<LoginVo> {
    const user = await prisma.user.findUnique({
      where: { username: dto.username },
      include: { employee: true }
    });

    if (!user) {
      throw AppError.badRequest('Invalid credentials');
    }

    if (user.status !== 'active') {
      // Security: Use generic error to prevent username enumeration
      throw AppError.badRequest('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    
    if (!isValid) {
      throw AppError.badRequest('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: (user as any).role,
        employeeId: user.employeeId 
      } as object,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: (user as any).role as UserRole,
        name: user.employee?.name,
        employeeId: user.employeeId ?? undefined
      }
    };
  }

  async getMe(userId: number): Promise<MeVo> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    if (!user) {
      throw AppError.notFound('User');
    }

    return {
      id: user.id,
      username: user.username,
      role: (user as any).role as UserRole,
      employeeId: user.employeeId ?? undefined,
      permissions: [] // TODO: Implement permissions based on role
    };
  }
}

export const authService = new AuthService();
