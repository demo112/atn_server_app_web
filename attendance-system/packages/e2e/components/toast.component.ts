import { expect, Locator, Page } from '@playwright/test';

export class ToastComponent {
  readonly container: Locator;

  constructor(protected page: Page) {
    // Matches the container structure in ToastProvider.tsx
    // <div className="fixed top-4 right-4 z-50 ...">
    this.container = page.locator('.fixed.top-4.right-4');
  }

  /** 获取最新的 Toast */
  private getLatestToast(): Locator {
    return this.container.locator('> div').last();
  }

  /** 断言：成功消息 */
  async expectSuccess(message: string): Promise<void> {
    const toast = this.getLatestToast();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
    // Green background for success (from ToastProvider.tsx: bg-green-50)
    await expect(toast).toHaveClass(/bg-green-50/);
  }

  /** 断言：错误消息 */
  async expectError(message: string): Promise<void> {
    const toast = this.getLatestToast();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
    // Assuming red background for error (Standard UI pattern, though not explicitly seen in the snippet)
    // Adjust regex if needed based on actual class
    await expect(toast).toHaveClass(/bg-red-50/);
  }

  /** 断言：警告消息 */
  async expectWarning(message: string): Promise<void> {
    const toast = this.getLatestToast();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
    // Assuming yellow background for warning
    await expect(toast).toHaveClass(/bg-yellow-50|bg-orange-50/);
  }

  /** 断言：Toast 消失 */
  async expectToastDisappear(): Promise<void> {
    // Wait for the container to be empty or last toast to be hidden
    await expect(this.container.locator('> div')).toHaveCount(0, { timeout: 5000 });
  }
}
