
import { describe, it, expect, vi } from 'vitest';
import { userService } from './user';
import { api } from './api';
import { z } from 'zod';

// Mock api module
vi.mock('./api', async () => {
  const actual = await vi.importActual('./api');
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('userService', () => {
  describe('deleteUser', () => {
    it('should successfully delete user when backend returns null', async () => {
      // Mock api.delete to return structure matching ApiResponse<null>
      (api.delete as any).mockResolvedValue({
        success: true,
        data: null,
      });

      // Should not throw
      await expect(userService.deleteUser(1)).resolves.not.toThrow();
    });

    it('should throw if backend returns unexpected data', async () => {
      // Mock api.delete to return something that doesn't match z.null()
      // Note: z.null() only accepts null, not undefined or objects
      (api.delete as any).mockResolvedValue({
        success: true,
        data: { id: 1 }, // This should fail z.null()
      });

      await expect(userService.deleteUser(1)).rejects.toThrow();
    });
  });
});
