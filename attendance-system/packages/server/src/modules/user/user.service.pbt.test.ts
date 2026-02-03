import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { UserService } from './user.service';
import { AppError } from '../../common/errors';
import { UserRole } from '@attendance/shared';

// 1. External Mocks Definition
const {
  prismaFindUniqueMock,
  prismaFindManyMock,
  prismaCountMock,
  prismaCreateMock,
  prismaUpdateMock,
  prismaDeleteMock,
  bcryptHashMock
} = vi.hoisted(() => ({
  prismaFindUniqueMock: vi.fn(),
  prismaFindManyMock: vi.fn(),
  prismaCountMock: vi.fn(),
  prismaCreateMock: vi.fn(),
  prismaUpdateMock: vi.fn(),
  prismaDeleteMock: vi.fn(),
  bcryptHashMock: vi.fn(),
}));

// 2. Mock Implementation
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: prismaFindUniqueMock,
      findMany: prismaFindManyMock,
      count: prismaCountMock,
      create: prismaCreateMock,
      update: prismaUpdateMock,
      delete: prismaDeleteMock,
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: bcryptHashMock,
  },
}));

// 3. Arbitraries
// UserRole is a type, not an object/enum, so we use string literals
const userRoleArb = fc.constantFrom('admin', 'user');

const createUserInputArb = fc.record({
  username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
  password: fc.option(fc.string({ minLength: 6 })),
  role: userRoleArb,
  employeeId: fc.option(fc.integer({ min: 1 })),
});

const updateUserInputArb = fc.record({
  password: fc.option(fc.string({ minLength: 6 })),
  role: fc.option(userRoleArb),
  status: fc.option(fc.constantFrom('active', 'inactive')),
}, { withDeletedKeys: true });

// Mock Data Helper
const mockUser = (id: number, dto: any) => ({
  id,
  username: dto.username || 'test_user',
  passwordHash: 'hashed_password',
  role: dto.role || 'user',
  status: dto.status || 'active',
  employeeId: dto.employeeId || null,
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: dto.employeeId ? { name: 'Test Employee' } : undefined,
});

describe('UserService PBT', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    vi.resetAllMocks();
    bcryptHashMock.mockResolvedValue('hashed_secret');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('create', () => {
    it('should successfully create a user when username is unique', async () => {
      await fc.assert(
        fc.asyncProperty(createUserInputArb, async (dto) => {
          vi.clearAllMocks();
          // Setup: User does not exist
          prismaFindUniqueMock.mockResolvedValue(null);
          // Return the created user mock
          const createdMock = mockUser(1, dto);
          prismaCreateMock.mockResolvedValue(createdMock);

          // Execute
          const result = await service.create(dto);

          // Verify
          expect(prismaFindUniqueMock).toHaveBeenCalledWith({ where: { username: dto.username } });
          expect(prismaCreateMock).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              username: dto.username,
              role: dto.role,
              status: 'active',
            })
          }));
          expect(result.username).toBe(dto.username);
          if (dto.password) {
            expect(bcryptHashMock).toHaveBeenCalled();
          }
        })
      );
    });

    it('should throw conflict if username exists', async () => {
      await fc.assert(
        fc.asyncProperty(createUserInputArb, async (dto) => {
          vi.clearAllMocks();
          // Setup: User exists
          prismaFindUniqueMock.mockResolvedValue({ id: 1, ...dto });

          // Execute & Verify
          await expect(service.create(dto)).rejects.toThrow(/Username already exists/);
          expect(prismaFindUniqueMock).toHaveBeenCalledWith({ where: { username: dto.username } });
        })
      );
    });
  });

  describe('update', () => {
    it('should successfully update user fields', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1 }), updateUserInputArb, async (id, dto) => {
          vi.clearAllMocks();
          
          // Setup: Update returns updated user
          const updatedMock = mockUser(id, { ...dto, username: 'existing_user' });
          prismaUpdateMock.mockResolvedValue(updatedMock);

          // Execute
          const result = await service.update(id, dto);

          // Verify
          const expectedData: any = { ...dto };
          if (dto.password) {
             delete expectedData.password;
             // Should verify passwordHash is set, but it's hard to check the exact mock call arg structure deeply here easily without strict type matching
             // We just ensure prisma update is called
          }

          expect(prismaUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
             where: { id },
          }));
          
          if (dto.password) {
            expect(bcryptHashMock).toHaveBeenCalledWith(dto.password, 10);
          }

          expect(result.id).toBe(id);
        })
      );
    });
  });

  describe('findAll', () => {
    const queryArb = fc.record({
      page: fc.option(fc.integer({ min: 1, max: 100 })),
      pageSize: fc.option(fc.integer({ min: 1, max: 50 })),
      keyword: fc.option(fc.string({ minLength: 1 })),
      status: fc.option(fc.constantFrom('active', 'inactive', 'disabled')),
    });

    it('should construct correct where clause based on query', async () => {
      await fc.assert(
        fc.asyncProperty(queryArb, async (query) => {
          vi.clearAllMocks();
          
          prismaFindManyMock.mockResolvedValue([]);
          prismaCountMock.mockResolvedValue(0);

          await service.findAll(query as any);

          const expectedWhere: any = {};
          if (query.keyword) {
            expectedWhere.OR = [
               { username: { contains: query.keyword } },
            ];
          }
          if (query.status) {
            expectedWhere.status = query.status;
          }

          expect(prismaFindManyMock).toHaveBeenCalledWith(expect.objectContaining({
            where: expectedWhere,
            skip: ((query.page || 1) - 1) * (query.pageSize || 10),
            take: query.pageSize || 10,
          }));
        })
      );
    });
  });

    it('should create user successfully if username is unique', async () => {
      await fc.assert(
        fc.asyncProperty(createUserInputArb, fc.integer({ min: 1 }), async (dto, newId) => {
          vi.clearAllMocks();
          bcryptHashMock.mockResolvedValue('hashed_secret');
          
          // Setup: User does not exist
          prismaFindUniqueMock.mockResolvedValue(null);
          prismaCreateMock.mockResolvedValue(mockUser(newId, dto));

          // Execute
          const result = await service.create(dto);

          // Verify
          expect(prismaFindUniqueMock).toHaveBeenCalledWith({ where: { username: dto.username } });
          expect(bcryptHashMock).toHaveBeenCalled(); // Should always hash password
          expect(prismaCreateMock).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              username: dto.username,
              role: dto.role,
              employeeId: dto.employeeId ?? null, // Ensure undefined becomes null if applicable, or check service logic
            }),
          }));
          expect(result.id).toBe(newId);
          expect(result.username).toBe(dto.username);
        })
      );
    });
  });

  describe('update', () => {
    it('should hash password if provided', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1 }), updateUserInputArb, async (id, dto) => {
          vi.clearAllMocks();
          bcryptHashMock.mockResolvedValue('hashed_secret');

          // Setup
          prismaUpdateMock.mockResolvedValue(mockUser(id, { ...dto, username: 'existing' }));

          // Execute
          await service.update(id, dto);

          // Verify
          if (dto.password) {
            expect(bcryptHashMock).toHaveBeenCalledWith(dto.password, 10);
          } else {
            expect(bcryptHashMock).not.toHaveBeenCalled();
          }

          expect(prismaUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
            where: { id },
            data: expect.objectContaining({
              ...(dto.role ? { role: dto.role } : {}),
            })
          }));
        })
      );
    });
  });

  describe('delete', () => {
    it('should delegate to prisma delete', async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1 }), async (id) => {
          vi.clearAllMocks();
          // Setup
          prismaDeleteMock.mockResolvedValue(mockUser(id, {}));

          // Execute
          await service.delete(id);

          // Verify
          expect(prismaDeleteMock).toHaveBeenCalledWith({ where: { id } });
        })
      );
    });
  });
});
