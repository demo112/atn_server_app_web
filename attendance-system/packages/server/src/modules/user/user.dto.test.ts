
import { describe, it, expect } from 'vitest';
import { createUserSchema } from './user.dto';

describe('User DTO Validation', () => {
  const LONG_STRING = 'A'.repeat(10001);

  describe('createUserSchema', () => {
    it('should validate valid input', () => {
      const input = {
        username: 'testuser',
        password: 'password123',
        role: 'user',
      };
      const result = createUserSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject username too short', () => {
      const input = {
        username: 'ab',
        password: 'password123',
        role: 'user',
      };
      const result = createUserSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 3 characters');
      }
    });

    it('should reject username too long (Hardening Gap)', () => {
      const input = {
        username: LONG_STRING,
        password: 'password123',
        role: 'user',
      };
      const result = createUserSchema.safeParse(input);
      
      // Currently, this passes because there is no .max()
      // We expect it to FAIL validation (success: false) if hardened.
      // But since we are "test only", this test will FAIL (success: true).
      // We assert success: false to demonstrate the gap.
      
      if (result.success) {
        console.warn('[GAP] User DTO accepted long username');
      }
      expect(result.success).toBe(false);
    });
  });
});
