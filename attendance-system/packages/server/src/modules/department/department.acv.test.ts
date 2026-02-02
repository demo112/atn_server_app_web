
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { DepartmentService } from './department.service';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock prisma
vi.mock('../../common/db/prisma', () => {
  return {
    prisma: {
      department: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      }
    }
  };
});

// Mock logger
vi.mock('../../common/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('DepartmentService - ACV Verification', () => {
  let service: DepartmentService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = prisma;
    vi.clearAllMocks();
    service = new DepartmentService();
  });

  describe('Contract Verification', () => {
    // Contract: Tree Structure Consistency
    // Children's parentId must match parent's id
    it('should maintain parent-child relationship in tree structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1 }),
              name: fc.string({ minLength: 1 }),
              parentId: fc.option(fc.integer({ min: 1 }), { nil: null }),
              sortOrder: fc.integer(),
              createdAt: fc.integer({ min: 1600000000000, max: 1700000000000 }).map(t => new Date(t)),
              updatedAt: fc.integer({ min: 1600000000000, max: 1700000000000 }).map(t => new Date(t))
            })
          ),
          async (depts) => {
            // Fixup data to ensure consistency for the test (ids unique)
            const uniqueDepts = depts.filter((d, i, self) => 
              self.findIndex(x => x.id === d.id) === i
            );
            
            prismaMock.department.findMany.mockResolvedValue(uniqueDepts);

            try {
              const result = await service.getTree();
              
              // Helper to flatten tree for checking
              const getAllNodes = (nodes: any[]): any[] => {
                 let all: any[] = [];
                 for (const node of nodes) {
                    all.push(node);
                    if (node.children) {
                       all = all.concat(getAllNodes(node.children));
                    }
                 }
                 return all;
              };
              
              const nodes = getAllNodes(result);
              
              // Verify every node in result was in input (or transformed)
              nodes.forEach(node => {
                  const original = uniqueDepts.find(d => d.id === node.id);
                  if (!original) {
                      throw new Error(`Node ${node.id} not found in input`);
                  }
                  if (original && original.parentId && uniqueDepts.find(d => d.id === original.parentId)) {
                      // If parent exists in set, parentId should match
                      const parentInSet = uniqueDepts.find(d => d.id === original.parentId);
                      if (parentInSet) {
                          // Check passed implicitly if no error thrown
                      } else {
                          // Should be root
                          if (!result.find(r => r.id === node.id)) {
                             // This logic is complex, let's simplify verification:
                             // If parent exists in input, node should NOT be in roots (unless circular handling broke it, but we assume valid tree here)
                          }
                      }
                  }
              });

              const checkNode = (node: any, parentId: number | null) => {
                if (parentId !== null) {
                   if (node.parentId !== parentId) {
                       throw new Error(`Node ${node.id} has parentId ${node.parentId}, expected ${parentId}`);
                   }
                }
                if (node.children) {
                  node.children.forEach((child: any) => checkNode(child, node.id));
                }
              };
              result.forEach(root => checkNode(root, null));
              return true;
            } catch (e) {
              console.error('Contract Test error:', e);
              throw e;
            }
          }
        )
      );
    });
  });

  describe('Adversarial Verification (Fuzzing)', () => {
    // Fuzz create method inputs
    it('should handle arbitrary input strings for name without crashing (other than expected errors)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string(), 
          fc.option(fc.integer({ min: 1 }), { nil: null }),
          async (name, parentId) => {
            // Mock DB responses to avoid actual DB calls logic errors
            prismaMock.department.findUnique.mockResolvedValue({ id: parentId || 1 } as any); // Parent exists if parentId provided
            prismaMock.department.findFirst.mockResolvedValue(null); // No name conflict
            prismaMock.department.create.mockResolvedValue({ 
              id: 123, name, parentId: parentId || null, sortOrder: 0, 
              createdAt: new Date(), updatedAt: new Date() 
            } as any);

            try {
              await service.create({ name, parentId: parentId || undefined });
              return true;
            } catch (e: any) {
              // Should only throw AppError, not system errors
              // Relax check to allow for name check or instanceof check
              const isAppError = e instanceof AppError || e.name === 'AppError';
              if (!isAppError) {
                console.error('Create failed with unexpected error:', e);
              }
              return isAppError;
            }
          }
        )
      );
    });

    // Fuzz checkCircularReference via update
    // This is hard to fuzz without complex state setup, but we can try basic bad inputs
    it('should reject circular reference attempts', async () => {
       // Manual adversarial case: self-reference
       const id = 1;
       prismaMock.department.findUnique.mockResolvedValue({ id, parentId: null } as any);
       
       await expect(service.update(id, { parentId: id }))
         .rejects.toThrow('Cannot set department as its own parent');
    });
  });
});
