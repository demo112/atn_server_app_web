import { request } from '@playwright/test';
import { ApiClient } from './utils/api-client';

/**
 * Playwright 全局 Setup
 * 在所有测试开始前执行一次
 */
async function globalSetup(): Promise<void> {
  console.log('[E2E] Global Setup 开始...');

  const requestContext = await request.newContext();
  const api = new ApiClient(requestContext);

  try {
    // 1. 验证后端服务可用
    console.log('[E2E] 验证后端服务...');
    await api.login('admin', '123456');
    console.log('[E2E] 后端服务正常');

    // 2. 兜底清理上次残留的测试数据
    // TODO: 修复 cleanupTestData 的前缀问题，目前会导致 hanging
    // console.log('[E2E] 清理残留测试数据...');
    // await api.cleanupTestData('[W');
    // console.log('[E2E] 残留数据清理完成');

  } catch (error) {
    console.error('[E2E] Global Setup 失败:', error);
    throw new Error('E2E 测试环境初始化失败，请确保后端服务已启动');
  }

  console.log('[E2E] Global Setup 完成');
}

export default globalSetup;
