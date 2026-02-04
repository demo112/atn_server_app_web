import { describe, test, expect, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { 
  getToken, 
  setToken, 
  getUser, 
  setUser, 
  TOKEN_KEY, 
  USER_KEY 
} from './auth';

// 模拟 localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Utils Property Tests', () => {
  afterEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Token Management', () => {
    // 属性：往返一致性 (Round-trip property)
    // setToken(t) -> getToken() === t
    test('should retrieve the same token that was set', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (token) => {
          setToken(token);
          expect(getToken()).toBe(token);
          expect(localStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, token);
        })
      );
    });
  });

  describe('User Management', () => {
    // 属性：JSON 序列化/反序列化一致性
    // setUser(u) -> getUser() deep equals u
    test('should retrieve the same user object that was set', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1 }),
            username: fc.string({ minLength: 1 }),
            role: fc.constantFrom('admin', 'user'), // Removed 'manager'
            name: fc.string(),
            employeeId: fc.integer({ min: 1 }),
          }),
          (user) => {
            // 需要处理 undefined，因为 JSON.stringify 会忽略 undefined 字段
            // 而 fast-check 生成的 record 可能包含 undefined
            // 我们这里简单地做一次 JSON parse/stringify 规范化，或者让 fast-check 生成不含 undefined 的对象
            // 为简单起见，我们直接比较经过 JSON 处理后的对象
            
            setUser(user);
            
            const retrieved = getUser();
            // retrieved 应该是 user 的副本，undefined 字段会消失，null 会保留
            const expected = JSON.parse(JSON.stringify(user));
            
            expect(retrieved).toEqual(expected);
            expect(localStorage.setItem).toHaveBeenCalledWith(USER_KEY, expect.any(String));
          }
        )
      );
    });
  });
});
