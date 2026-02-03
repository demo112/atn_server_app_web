import { describe, it, expect } from 'vitest';
import { loginSchema } from './auth.dto';

describe('Auth DTO', () => {
  describe('loginSchema', () => {
    it('should validate valid input', () => {
      const result = loginSchema.safeParse({
        username: 'testuser',
        password: 'password123'
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const result = loginSchema.safeParse({
        username: '',
        password: 'password123'
      });
      expect(result.success).toBe(false);
    });

    it('should reject extremely long username (DoS prevention)', () => {
      const longUsername = 'a'.repeat(101); // Assuming 100 char limit
      const result = loginSchema.safeParse({
        username: longUsername,
        password: 'password123'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('too large'); // Zod default or custom
      }
    });

    it('should reject extremely long password', () => {
        const longPassword = 'a'.repeat(101);
        const result = loginSchema.safeParse({
            username: 'testuser',
            password: longPassword
        });
        expect(result.success).toBe(false);
    });
  });
});
