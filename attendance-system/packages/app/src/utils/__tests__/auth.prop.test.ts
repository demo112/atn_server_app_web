import fc from 'fast-check';
import * as AuthUtils from '../auth';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('Auth Utils Property Tests', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = new Map();
    
    // Mock implementation using memory map
    (SecureStore.setItemAsync as jest.Mock).mockImplementation(async (key, value) => {
      store.set(key, value);
    });
    (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) => {
      return store.get(key) ?? null;
    });
    (SecureStore.deleteItemAsync as jest.Mock).mockImplementation(async (key) => {
      store.delete(key);
    });
  });

  test('setToken and getToken should satisfy round-trip property', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (token) => {
        // Clear store for each run to ensure isolation
        store.clear();
        
        await AuthUtils.setToken(token);
        const retrieved = await AuthUtils.getToken();
        expect(retrieved).toBe(token);
      })
    );
  });

  test('removeToken should result in null token', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (token) => {
        store.clear();
        await AuthUtils.setToken(token);
        await AuthUtils.removeToken();
        const retrieved = await AuthUtils.getToken();
        expect(retrieved).toBeNull();
      })
    );
  });

  test('setUser and getUser should satisfy round-trip property', async () => {
    // Generate a simplified user object structure based on LoginVo['user']
    // We don't have the exact type imported here easily for arb generation without schema,
    // but JSON.stringify/parse handles any JSON-serializable object.
    const userArb = fc.record({
      id: fc.integer(),
      username: fc.string(),
      email: fc.emailAddress(),
      name: fc.string(),
      role: fc.constantFrom('admin', 'user', 'manager'),
      departmentId: fc.option(fc.integer())
    });

    await fc.assert(
      fc.asyncProperty(userArb, async (user) => {
        store.clear();
        await AuthUtils.setUser(user as any);
        const retrieved = await AuthUtils.getUser();
        expect(retrieved).toEqual(user);
      })
    );
  });
});
