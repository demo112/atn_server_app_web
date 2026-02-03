import { describe, it, expect, beforeEach } from 'vitest';
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  clearAuth,
  TOKEN_KEY,
  USER_KEY,
} from './auth';

describe('utils/auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Token Management', () => {
    it('should set and get token', () => {
      const token = 'test-token';
      setToken(token);
      expect(getToken()).toBe(token);
      expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    });

    it('should remove token', () => {
      setToken('test-token');
      removeToken();
      expect(getToken()).toBeNull();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  describe('User Management', () => {
    const user = { id: 1, name: 'Test User' };

    it('should set and get user', () => {
      setUser(user);
      expect(getUser()).toEqual(user);
      expect(localStorage.getItem(USER_KEY)).toBe(JSON.stringify(user));
    });

    it('should handle null user', () => {
      expect(getUser()).toBeNull();
    });

    it('should remove user', () => {
      setUser(user);
      removeUser();
      expect(getUser()).toBeNull();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
  });

  describe('clearAuth', () => {
    it('should clear both token and user', () => {
      setToken('test-token');
      setUser({ id: 1 });
      
      clearAuth();
      
      expect(getToken()).toBeNull();
      expect(getUser()).toBeNull();
    });
  });
});
