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

    // Explicitly cast role to string to ensure compatibility
    const role = user.role as unknown as string;

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: role,
        employeeId: user.employeeId 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: role as UserRole,
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

    const role = user.role as unknown as string;

    return {
      id: user.id,
      username: user.username,
      role: role as UserRole,
      employeeId: user.employeeId ?? undefined,
      permissions: [] // TODO: Implement permissions based on role
    };
  }
}

export const authService = new AuthService();
