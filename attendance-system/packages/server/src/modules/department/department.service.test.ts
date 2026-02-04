
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { DepartmentService } from './department.service';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';

// Mock prisma module
vi.mock('../../common/db/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Mock logger to avoid console output during tests
vi.mock('../../common/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('DepartmentService', () => {
  let service: DepartmentService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
    mockReset(prismaMock);
    service = new DepartmentService();
  });

  describe('getTree', () => {
    it('should return empty array when no departments exist', async () => {
      prismaMock.department.findMany.mockResolvedValue([]);
      
      const result = await service.getTree();
      
      expect(result).toEqual([]);
      expect(prismaMock.department.findMany).toHaveBeenCalledWith({
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should build a department tree correctly', async () => {
      const now = new Date();
      const depts = [
        { id: 1, name: 'Root', parentId: null, sortOrder: 0, createdAt: now, updatedAt: now },
        { id: 2, name: 'Child 1', parentId: 1, sortOrder: 0, createdAt: now, updatedAt: now },
        { id: 3, name: 'Child 2', parentId: 1, sortOrder: 1, createdAt: now, updatedAt: now },
        { id: 4, name: 'Grandchild', parentId: 2, sortOrder: 0, createdAt: now, updatedAt: now },
      ];
      
      // @ts-expect-error: mock value
      prismaMock.department.findMany.mockResolvedValue(depts as any);

      const result = await service.getTree();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].id).toBe(2);
      expect(result[0].children![1].id).toBe(3);
      expect(result[0].children![0].children).toHaveLength(1);
      expect(result[0].children![0].children![0].id).toBe(4);
    });

    it('should handle orphaned nodes by treating them as roots', async () => {
      const now = new Date();
      // Child points to non-existent parent 99
      const depts = [
        { id: 1, name: 'Root', parentId: null, sortOrder: 0, createdAt: now, updatedAt: now },
        { id: 2, name: 'Orphan', parentId: 99, sortOrder: 0, createdAt: now, updatedAt: now },
      ];
      
      // @ts-expect-error: mock value
      prismaMock.department.findMany.mockResolvedValue(depts as any);

      const result = await service.getTree();

      expect(result).toHaveLength(2);
      expect(result.find(d => d.id === 1)).toBeDefined();
      expect(result.find(d => d.id === 2)).toBeDefined();
    });
  });

  describe('create', () => {
    const now = new Date();

    it('should create a root department', async () => {
      const dto = { name: 'New Dept' };
      const created = { id: 1, name: 'New Dept', parentId: null, sortOrder: 0, createdAt: now, updatedAt: now };
      
      prismaMock.department.findFirst.mockResolvedValue(null); // No name conflict
      // @ts-expect-error: mock value
      prismaMock.department.create.mockResolvedValue(created as any);

      const result = await service.create(dto);

      expect(result.id).toBe(1);
      expect(prismaMock.department.create).toHaveBeenCalledWith({
        data: { name: 'New Dept', parentId: undefined, sortOrder: 0 },
      });
    });

    it('should throw if parent does not exist', async () => {
      const dto = { name: 'Child', parentId: 999 };
      prismaMock.department.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(AppError);
      await expect(service.create(dto)).rejects.toHaveProperty('code', 'ERR_PARENT DEPARTMENT_NOT_FOUND');
    });

    it('should throw if name exists in same level', async () => {
      const dto = { name: 'Existing', parentId: 1 };
      const parent = { id: 1 };
      // @ts-expect-error: mock value
      prismaMock.department.findUnique.mockResolvedValue(parent as any);
      // @ts-expect-error: mock value
      prismaMock.department.findFirst.mockResolvedValue({ id: 2 } as any);

      await expect(service.create(dto)).rejects.toThrow('Department name already exists');
    });
  });

  describe('update', () => {
    const now = new Date();
    const existing = { id: 2, name: 'Dept', parentId: 1, sortOrder: 0, createdAt: now, updatedAt: now };

    it('should update department name', async () => {
      
      prismaMock.department.findUnique.mockResolvedValue(existing as any);
      prismaMock.department.findFirst.mockResolvedValue(null); // No conflict
      // @ts-expect-error: mock value
      prismaMock.department.update.mockResolvedValue({ ...existing, name: 'New Name' });

      const result = await service.update(2, { name: 'New Name' });

      expect(result.name).toBe('New Name');
    });

    it('should throw if setting parent to self', async () => {
      // @ts-expect-error: mock value
      prismaMock.department.findUnique.mockResolvedValue(existing);

      await expect(service.update(2, { parentId: 2 })).rejects.toThrow('Cannot set department as its own parent');
    });

    it('should detect circular reference', async () => {
      // Structure: 1 -> 2 -> 3
      // Try to move 1 to under 3
      const dept1 = { id: 1, parentId: null };
      
      // Mock findUnique for initial check
      // @ts-expect-error: mock value
      prismaMock.department.findUnique.mockResolvedValue(dept1 as any);

      // Mock checkCircularReference traversals
      // Checking if 1 is ancestor of 3
      // Path from 3 up: 3 -> 2 -> 1
      prismaMock.department.findUnique
        .mockResolvedValueOnce(dept1 as any) // Initial get
        .mockResolvedValueOnce({ parentId: 2 } as any) // Get 3's parent -> 2
        .mockResolvedValueOnce({ parentId: 1 } as any) // Get 2's parent -> 1
        .mockResolvedValueOnce({ parentId: null } as any); // Get 1's parent -> null

      // Wait, the logic is: checkCircularReference(targetId=1, newParentId=3)
      // Loop: current=3. 3!=1. Get 3's parent (2).
      // Loop: current=2. 2!=1. Get 2's parent (1).
      // Loop: current=1. 1==1. Throw.

      // So we need to mock findUnique calls inside checkCircularReference
      // First call inside loop: findUnique({ where: { id: 3 } }) -> returns { parentId: 2 }
      // Second call inside loop: findUnique({ where: { id: 2 } }) -> returns { parentId: 1 }

      // Reset mock to be sure
      mockReset(prismaMock);
      // @ts-expect-error: mock implementation
      prismaMock.department.findUnique.mockImplementation((args) => {
        if (args.where.id === 1) return Promise.resolve(dept1);
        if (args.where.id === 3) return Promise.resolve({ parentId: 2 });
        if (args.where.id === 2) return Promise.resolve({ parentId: 1 });
        return Promise.resolve(null);
      });

      await expect(service.update(1, { parentId: 3 })).rejects.toThrow('Circular reference detected');
    });

    it('should stop checking circular reference after MAX_DEPTH', async () => {
      const now = new Date();
      const dept1 = { id: 1, parentId: null, createdAt: now, updatedAt: now };
      
      mockReset(prismaMock);
      // @ts-expect-error: mock implementation
      prismaMock.department.findUnique.mockImplementation((args) => {
        if (args.where.id === 1) return Promise.resolve(dept1);
        // Simulate a very deep chain: N -> N-1 -> ... -> 2 -> 1
        // We are updating 1 to have parent N.
        // The check starts at N, goes up.
        // We simulate that after 20 steps, we still haven't reached 1 (or we just mock it to be safe)
        // Actually, let's just simulate a chain of 25 nodes that DOES lead to 1, 
        // but ensure the code stops checking after 20.
        
        // args.where.id will be the 'currentId' in the loop
        const id = args.where.id;
        if (id > 1 && id <= 25) {
          return Promise.resolve({ parentId: id - 1 });
        }
        if (id === 1) return Promise.resolve({ parentId: null });
        return Promise.resolve(null);
      });

      // Update 1 to be child of 25. Cycle is 1 -> 25 -> 24 ... -> 1
      // Check starts at 25.
      // 25 -> 24 (depth 0)
      // ...
      // 5 -> 4 (depth 20) -> LOOP BREAKS (MAX_DEPTH = 20)
      // So it should NOT throw.
      
      // Note: This relies on internal implementation detail MAX_DEPTH=20.
      // If we want to strictly test this, we should verify it DOES NOT throw.
      
      // Mock update to succeed
      // @ts-expect-error: mock value
      prismaMock.department.update.mockResolvedValue({ ...dept1, parentId: 25, name: 'Dept1', sortOrder: 0 });

      await expect(service.update(1, { parentId: 25 })).resolves.not.toThrow();
    });
  });

  describe('delete', () => {
    const now = new Date();
    const existing = { id: 1, name: 'Dept', parentId: null, sortOrder: 0, createdAt: now, updatedAt: now };

    it('should delete department', async () => {
      // @ts-expect-error: mock value
      prismaMock.department.findUnique.mockResolvedValue(existing);
      prismaMock.department.count.mockResolvedValue(0); // No children, no employees
      prismaMock.employee.count.mockResolvedValue(0);

      await service.delete(1);

      expect(prismaMock.department.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw if has children', async () => {
      // @ts-expect-error: mock value
      prismaMock.department.findUnique.mockResolvedValue(existing);
      prismaMock.department.count.mockResolvedValue(1); // Has children

      await expect(service.delete(1)).rejects.toThrow('Cannot delete department with sub-departments');
    });

    it('should throw if has employees', async () => {
      // @ts-expect-error: mock value
      prismaMock.department.findUnique.mockResolvedValue(existing);
      prismaMock.department.count.mockResolvedValue(0);
      prismaMock.employee.count.mockResolvedValue(1); // Has employees

      await expect(service.delete(1)).rejects.toThrow('Cannot delete department with employees');
    });
  });
});
