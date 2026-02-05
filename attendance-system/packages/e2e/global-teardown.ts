import { ApiClient } from './utils/api-client';

/**
 * Playwright 全局 Teardown
 * 在所有测试结束后执行一次
 */
async function globalTeardown(): Promise<void> {
  console.log('[E2E] Global Teardown 开始...');

  const api = new ApiClient();

  try {
    // 登录
    await api.login('admin', 'admin123');

    // 兜底清理所有带 [W 前缀的测试数据
    console.log('[E2E] 兜底清理测试数据...');
    await api.cleanupTestData('[W');
    console.log('[E2E] 测试数据清理完成');

  } catch (error) {
    // Teardown 失败不阻塞，只记录警告
    console.warn('[E2E] Global Teardown 警告:', error);
  }

  console.log('[E2E] Global Teardown 完成');
}

export default globalTeardown;
