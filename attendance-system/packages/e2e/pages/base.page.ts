import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  /** 页面 URL 路径 */
  abstract readonly url: string;

  /** 导航到页面 */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** 等待页面加载完成 */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** 获取 Toast 容器 */
  getToast(): Locator {
    // 匹配 Toast 容器下的直接子元素（具体的 Toast 消息）
    return this.page.locator('.fixed.top-4.right-4 > div');
  }

  /** 获取 Modal 容器 */
  getModal(): Locator {
    return this.page.locator('[role="dialog"]');
  }
}
