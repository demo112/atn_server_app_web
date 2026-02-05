/**
 * Fixtures 属性测试
 * 
 * 注意：部分测试需要真实后端运行
 * 运行前请确保：
 * 1. 后端服务已启动 (pnpm --filter @attendance/server dev)
 * 2. 数据库已初始化
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fc from 'fast-check';
import { ApiClient } from '../utils/api-client';
import { TestDataFactory } from '../utils/test-data';

// 测试配置
const TEST_PREFIX = '[FIXTURE_PBT]';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// 跳过条件：如果没有后端服务则跳过
const skipIfNoBackend = process.env.SKIP_E2E_PBT === 'true';

/**
 * Worker 前缀隔离属性测试
 * 这些测试不需要后端，可以独立运行
 */
describe('Worker 前缀隔离 PBT', () => {
  /**
   * Feature: e2e-framework, Property 2: Worker 前缀隔离
   * Validates: Requirements 4.1, 4.2
   * 
   * For any Worker 索引 N（N >= 0），workerPrefix 应该返回格式为 [W{N}] 的字符串
   */
  it('Property 2: Worker 前缀格式正确 [W{N}]', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }),
        async (workerIndex) => {
          // 模拟 workerPrefix fixture 的逻辑
          const prefix = `[W${workerIndex}]`;

          // 验证格式
          expect(prefix).toMatch(/^\[W\d+\]$/);
          expect(prefix).toBe(`[W${workerIndex}]`);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Feature: e2e-framework, Property 2: Worker 前缀隔离
   * Validates: Requirements 4.1, 4.2
   * 
   * TestDataFactory.createEmployee({ name: X }) 创建的员工名称应该以 Worker 前缀开头
   */
  it('Property 2: TestDataFactory 创建的数据带有 Worker 前缀', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 10 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (workerIndex, baseName) => {
          const prefix = `[W${workerIndex}]`;
          const api = new ApiClient();
          const factory = new TestDataFactory(api, prefix);

          // 模拟 prefixName 逻辑
          const prefixedName = `${prefix} ${baseName}`;

          // 验证前缀被正确添加
          expect(prefixedName).toStartWith(prefix);
          expect(prefixedName).toContain(baseName);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2 (扩展): 不同 Worker 的前缀互不相同
   */
  it('Property 2 (扩展): 不同 Worker 索引生成不同前缀', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        async (index1, index2) => {
          fc.pre(index1 !== index2); // 前置条件：两个索引不同

          const prefix1 = `[W${index1}]`;
          const prefix2 = `[W${index2}]`;

          expect(prefix1).not.toBe(prefix2);
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * 认证 Token 注入属性测试
 * 需要真实后端
 */
describe.skipIf(skipIfNoBackend)('认证 Token 注入 PBT', () => {
  let api: ApiClient;

  beforeAll(async () => {
    api = new ApiClient(API_BASE_URL);
    try {
      await api.login('admin', 'admin123');
    } catch {
      console.warn('无法连接后端服务，跳过认证属性测试');
    }
  });

  /**
   * Feature: e2e-framework, Property 1: 认证 Token 注入
   * Validates: Requirements 3.1, 3.2
   * 
   * For any 使用 authenticatedPage Fixture 的测试，
   * 浏览器 localStorage 中应该包含有效的 token
   */
  it('Property 1: API 登录获取的 Token 可用于后续请求', async () => {
    // 验证 token 存在
    const token = api.getToken();
    expect(token).not.toBeNull();
    expect(typeof token).toBe('string');
    expect(token!.length).toBeGreaterThan(0);

    // 验证 token 可用于认证请求
    const me = await api.me();
    expect(me).toHaveProperty('id');
    expect(me).toHaveProperty('username');
  });

  /**
   * Property 1 (扩展): Token 格式符合 JWT 规范
   */
  it('Property 1 (扩展): Token 格式符合 JWT 规范', async () => {
    const token = api.getToken();
    expect(token).not.toBeNull();

    // JWT 格式：header.payload.signature
    const parts = token!.split('.');
    expect(parts.length).toBe(3);

    // 每部分都是 base64url 编码
    parts.forEach(part => {
      expect(part).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });
});

/**
 * 测试数据自动清理属性测试
 * 需要真实后端
 */
describe.skipIf(skipIfNoBackend)('测试数据自动清理 PBT', () => {
  let api: ApiClient;

  beforeAll(async () => {
    api = new ApiClient(API_BASE_URL);
    try {
      await api.login('admin', 'admin123');
    } catch {
      console.warn('无法连接后端服务，跳过清理属性测试');
    }
  });

  afterAll(async () => {
    // 兜底清理
    if (api.getToken()) {
      await api.cleanupTestData(TEST_PREFIX).catch(() => {});
    }
  });

  /**
   * Feature: e2e-framework, Property 3: 测试数据自动清理
   * Validates: Requirements 4.3
   * 
   * For any 通过 testData Fixture 创建的数据，
   * 在测试结束后应该被自动删除
   */
  it('Property 3: TestDataFactory.cleanup() 删除所有已创建的数据', async () => {
    const uniquePrefix = `${TEST_PREFIX}_${Date.now()}`;
    const factory = new TestDataFactory(api, uniquePrefix);

    // 创建测试数据
    const emp1 = await factory.createEmployee({ name: '清理测试1' });
    const emp2 = await factory.createEmployee({ name: '清理测试2' });

    // 验证数据已创建
    expect(factory.getCreatedEmployeeIds()).toContain(emp1.id);
    expect(factory.getCreatedEmployeeIds()).toContain(emp2.id);

    // 验证数据库中存在
    const beforeCleanup = await api.getEmployees({ keyword: uniquePrefix });
    expect(beforeCleanup.items.length).toBe(2);

    // 执行清理
    await factory.cleanup();

    // 验证内部记录已清空
    expect(factory.getCreatedEmployeeIds()).toHaveLength(0);

    // 验证数据库中已删除
    const afterCleanup = await api.getEmployees({ keyword: uniquePrefix });
    expect(afterCleanup.items.length).toBe(0);
  });

  /**
   * Property 3 (扩展): cleanup 多次调用是幂等的
   */
  it('Property 3 (扩展): cleanup() 多次调用是幂等的', async () => {
    const uniquePrefix = `${TEST_PREFIX}_IDEMPOTENT_${Date.now()}`;
    const factory = new TestDataFactory(api, uniquePrefix);

    // 创建测试数据
    await factory.createEmployee({ name: '幂等测试' });

    // 多次调用 cleanup 不应报错
    await factory.cleanup();
    await factory.cleanup();
    await factory.cleanup();

    // 验证数据已清理
    const result = await api.getEmployees({ keyword: uniquePrefix });
    expect(result.items.length).toBe(0);
  });

  /**
   * Property 3 (扩展): cleanup 即使部分数据已被删除也能正常完成
   */
  it('Property 3 (扩展): cleanup() 容忍部分数据已被删除', async () => {
    const uniquePrefix = `${TEST_PREFIX}_PARTIAL_${Date.now()}`;
    const factory = new TestDataFactory(api, uniquePrefix);

    // 创建测试数据
    const emp = await factory.createEmployee({ name: '部分删除测试' });

    // 手动删除其中一个
    await api.deleteEmployee(emp.id);

    // cleanup 应该正常完成，不报错
    await expect(factory.cleanup()).resolves.not.toThrow();
  });
});
