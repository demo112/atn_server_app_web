import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

// Mock logger
vi.mock('../../common/logger', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  };
  return {
    logger: mockLogger,
    createLogger: vi.fn(() => mockLogger),
  };
});

// Mock Prisma
vi.mock('../../common/db/prisma', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

// Mock Auth Middleware
// We mock it to allow all requests as 'admin'
vi.mock('../../common/middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    // Inject user directly, skipping header check
    req.user = { id: 1, role: 'admin', username: 'test_admin' };
    next();
  },
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

