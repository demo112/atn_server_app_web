/**
 * API 辅助层属性测试
 * 
 * 注意：这些测试需要真实后端运行，属于集成测试范畴
 * 运行前请确保：
 * 1. 后端服务已启动 (pnpm --filter @attendance/server dev)
 * 2. 数据库已初始化
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';
import { ApiClient } from './api-client';

// 测试配置
const TEST_PREFIX = '[PBT]';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 跳过条件：如果没有后端服务则跳过
const skipIfNoBackend = process.env.SKIP_E2E_PBT === 'true';

describe.skipIf(skipIfNoBackend)('ApiClient PBT', () => {
  let api: ApiClient;

  beforeAll(async () => {
    api = new ApiClient(API_BASE_URL);
    // 登录获取 token
    try {
      await api.login('admin', 'admin123');
    } catch {
      console.warn('无法连接后端服务，跳过 API 属性测试');
    }
  });

  afterAll(async () => {
    // 清理测试数据
    if (api.getToken()) {
      await api.cleanupTestData(TEST_PREFIX).catch(() => {});
    }
  });

  /**
   * Feature: e2e-framework, Property 4: API 登录返回 Token
   * Validates: Requirements 5.1
   * 
   * For any 有效的用户名密码组合，login() 应该返回包含非空 token 的对象
   */
  it('Property 4: API 登录返回有效 Token', async () => {
    const freshApi = new ApiClient(API_BASE_URL);
    const result = await freshApi.login('admin', 'admin123');

    expect(result).toHaveProperty('token');
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('user');
    expect(result.user).toHaveProperty('id');
  });

  /**
   * Feature: e2e-framework, Property 4 (扩展): 登录后 token 被正确设置
   * Validates: Requirements 5.1
   */
  it('Property 4 (扩展): 登录后 token 被正确设置到客户端', async () => {
    const freshApi = new ApiClient(API_BASE_URL);
    expect(freshApi.getToken()).toBeNull();

    await freshApi.login('admin', 'admin123');

    expect(freshApi.getToken()).not.toBeNull();
    expect(typeof freshApi.getToken()).toBe('string');
  });

  /**
   * Feature: e2e-framework, Property 5: 前缀批量清理
   * Validates: Requirements 5.3
   * 
   * For any 前缀字符串 P 和一组带该前缀的测试数据，
   * 调用 cleanupTestData(P) 后，所有名称包含 P 的数据应该被删除
   */
  it('Property 5: 前缀批量清理能删除所有带前缀的数据', async () => {
    // 创建带前缀的测试数据
    const uniquePrefix = `${TEST_PREFIX}_${Date.now()}`;
    const createdIds: number[] = [];

    // 创建 3 个带前缀的员工
    for (let i = 0; i < 3; i++) {
      const emp = await api.createEmployee({
        name: `${uniquePrefix} 测试员工${i}`,
        employeeNo: `E${Date.now()}${i}`,
        phone: `138${Date.now().toString().slice(-8)}${i}`.slice(0, 11),
      });
      createdIds.push(emp.id);
    }

    // 验证数据已创建
    const beforeCleanup = await api.getEmployees({ keyword: uniquePrefix });
    expect(beforeCleanup.items.length).toBe(3);

    // 执行清理
    await api.cleanupTestData(uniquePrefix);

    // 验证数据已删除
    const afterCleanup = await api.getEmployees({ keyword: uniquePrefix });
    expect(afterCleanup.items.length).toBe(0);
  });
});

/**
 * TestDataFactory 唯一值生成属性测试
 * 这些测试不需要后端，可以独立运行
 */
describe('TestDataFactory 唯一值生成 PBT', () => {
  /**
   * Feature: e2e-framework, Property 6: 唯一值生成
   * Validates: Requirements 5.4
   * 
   * For any 连续 N 次调用 generatePhone()，返回的 N 个值应该互不相同
   */
  it('Property 6: generatePhone 生成唯一手机号', async () => {
    // 动态导入避免类型问题
    const { TestDataFactory } = await import('./test-data');
    const { ApiClient } = await import('./api-client');

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 100 }),
        async (count) => {
          const api = new ApiClient();
          const factory = new TestDataFactory(api, '[TEST]');
          const phones = new Set<string>();

          for (let i = 0; i < count; i++) {
            phones.add(factory.generatePhone());
          }

          // 所有生成的手机号应该互不相同
          expect(phones.size).toBe(count);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Feature: e2e-framework, Property 6: 唯一值生成
   * Validates: Requirements 5.4
   * 
   * For any 连续 N 次调用 generateEmployeeNo()，返回的 N 个值应该互不相同
   */
  it('Property 6: generateEmployeeNo 生成唯一工号', async () => {
    const { TestDataFactory } = await import('./test-data');
    const { ApiClient } = await import('./api-client');

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 100 }),
        async (count) => {
          const api = new ApiClient();
          const factory = new TestDataFactory(api, '[TEST]');
          const employeeNos = new Set<string>();

          for (let i = 0; i < count; i++) {
            employeeNos.add(factory.generateEmployeeNo());
          }

          // 所有生成的工号应该互不相同
          expect(employeeNos.size).toBe(count);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6 (扩展): 手机号格式正确
   */
  it('Property 6 (扩展): generatePhone 生成的手机号格式正确', async () => {
    const { TestDataFactory } = await import('./test-data');
    const { ApiClient } = await import('./api-client');

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 50 }),
        async (count) => {
          const api = new ApiClient();
          const factory = new TestDataFactory(api, '[TEST]');

          for (let i = 0; i < count; i++) {
            const phone = factory.generatePhone();
            // 手机号应该是 11 位数字，以 1 开头
            expect(phone).toMatch(/^1\d{10}$/);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6 (扩展): 工号包含前缀标识
   */
  it('Property 6 (扩展): generateEmployeeNo 生成的工号以 E 开头', async () => {
    const { TestDataFactory } = await import('./test-data');
    const { ApiClient } = await import('./api-client');

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 10 }),
        async (prefix) => {
          const api = new ApiClient();
          const factory = new TestDataFactory(api, prefix);
          const employeeNo = factory.generateEmployeeNo();

          // 工号应该以 E 开头
          expect(employeeNo).toMatch(/^E/);
        }
      ),
      { numRuns: 20 }
    );
  });
});
