import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../app';
import { prisma } from '../../common/db/prisma';

// Mock logger
vi.mock('../../common/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn((msg, ...args) => console.error('[MOCK ERROR]', msg, ...args)),
    warn: vi.fn((msg, ...args) => console.warn('[MOCK WARN]', msg, ...args)),
    debug: vi.fn(),
  };
  return {
    logger: mockLogger,
    createLogger: vi.fn().mockReturnValue(mockLogger),
  };
});

// Mock Prisma
vi.mock('../../common/db/prisma', () => ({
  prisma: {
    department: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    employee: {
      count: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('Department API Integration', () => {
  const token = jwt.sign(
    { id: 1, username: 'admin', role: 'admin' },
    process.env.JWT_SECRET || 'secret'
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/departments/tree', () => {
    it('AC1: should return department tree structure', async () => {
      const depts = [
        { id: 1, name: 'Root', parentId: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, name: 'Child', parentId: 1, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
      ];
      (prisma.department.findMany as any).mockResolvedValue(depts);

      const res = await request(app)
        .get('/api/v1/departments/tree')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // The service should transform flat list to tree
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(1);
      expect(res.body.data[0].children).toHaveLength(1);
      expect(res.body.data[0].children[0].id).toBe(2);
    });
  });

  describe('POST /api/v1/departments', () => {
    it('AC2: should create sub-department', async () => {
      const dto = { name: 'New Dept', parentId: 1, sortOrder: 0 };
      (prisma.department.findUnique as any).mockResolvedValue({ id: 1, name: 'Root' }); // Check parent exists
      (prisma.department.create as any).mockResolvedValue({ 
        id: 3, 
        ...dto, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      });

      const res = await request(app)
        .post('/api/v1/departments')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Dept');
    });
  });

  describe('PUT /api/v1/departments/:id', () => {
    it('AC3: should update department name', async () => {
      const dto = { name: 'Updated Name', sortOrder: 0 };
      (prisma.department.findUnique as any).mockResolvedValue({ id: 2, name: 'Old', parentId: 1, sortOrder: 0 });
      // For circular check, it might fetch all or traverse up. 
      // Assuming logic: if parentId changes, check circle. Here parentId doesn't change.
      (prisma.department.update as any).mockResolvedValue({ 
        id: 2, 
        ...dto, 
        parentId: 1,
        createdAt: new Date(), 
        updatedAt: new Date()
      });

      const res = await request(app)
        .put('/api/v1/departments/2')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('AC6: should prevent circular reference', async () => {
      const dto = { parentId: 2 }; // Trying to set parent to itself
      
      // 1. Service fetches target dept
      (prisma.department.findUnique as any).mockResolvedValue({ id: 2, name: 'Child', parentId: 1 });
      
      // 2. Service might fetch all depts to build tree for cycle check
      (prisma.department.findMany as any).mockResolvedValue([
         { id: 1, name: 'Root', parentId: null, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
         { id: 2, name: 'Child', parentId: 1, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() }
      ]);

      const res = await request(app)
        .put('/api/v1/departments/2')
        .set('Authorization', `Bearer ${token}`)
        .send(dto);

      // Expecting 400 Bad Request
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/departments/:id', () => {
    it('AC4: should delete department', async () => {
      (prisma.department.findUnique as any).mockResolvedValue({ id: 3, name: 'Leaf' });
      // Check children
      (prisma.department.count as any).mockResolvedValueOnce(0); 
      // Check employees
      (prisma.employee.count as any).mockResolvedValue(0); 
      // Delete
      (prisma.department.delete as any).mockResolvedValue({ id: 3 });

      const res = await request(app)
        .delete('/api/v1/departments/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('AC5: should prevent deletion if has children', async () => {
      (prisma.department.findUnique as any).mockResolvedValue({ id: 1, name: 'Root' });
      // Check children -> returns existing child
      (prisma.department.findFirst as any).mockResolvedValueOnce({ id: 2 }); 

      const res = await request(app)
        .delete('/api/v1/departments/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('AC5: should prevent deletion if has employees', async () => {
      (prisma.department.findUnique as any).mockResolvedValue({ id: 3, name: 'Leaf' });
      // Check children -> null
      (prisma.department.findFirst as any).mockResolvedValueOnce(null);
      // Check employees -> returns existing employee
      (prisma.employee.findFirst as any).mockResolvedValue({ id: 100 }); 

      const res = await request(app)
        .delete('/api/v1/departments/3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
