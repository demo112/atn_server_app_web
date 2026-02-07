import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateResponse } from './api';

describe('services/api', () => {
  describe('validateResponse', () => {
    it('should pass when schema matches data', () => {
      const schema = z.object({ id: z.number() });
      const response = { success: true, data: { id: 1 } };
      
      const result = validateResponse(schema, response);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw when success is false', () => {
      const schema = z.any();
      const response = { success: false, error: { message: 'Failed' } };
      
      expect(() => validateResponse(schema, response)).toThrow('Failed');
    });

    it('should throw when schema validation fails', () => {
      const schema = z.string();
      const response = { success: true, data: 123 };
      
      expect(() => validateResponse(schema, response)).toThrow();
    });

    // Regression test for user deletion bug
    it('should handle null data correctly with z.null()', () => {
      const schema = z.null();
      const response = { success: true, data: null };
      
      const result = validateResponse(schema, response);
      expect(result).toBeNull();
    });

    it('should throw when using z.void() with null data', () => {
      const schema = z.void();
      const response = { success: true, data: null };
      
      // This confirms why the bug happened
      expect(() => validateResponse(schema, response)).toThrow();
    });
  });
});
