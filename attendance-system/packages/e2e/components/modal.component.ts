import { Locator, Page } from '@playwright/test';

export class ModalComponent {
  readonly root: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(protected page: Page) {
    this.root = page.locator('[role="dialog"]');
    this.title = this.root.locator('h2#modal-title');
    this.closeButton = this.root.locator('button[aria-label="Close"]');
    // Common button names in Chinese/English
    this.confirmButton = this.root.locator('button').filter({ hasText: /确定|Confirm|OK/i });
    this.cancelButton = this.root.locator('button').filter({ hasText: /取消|Cancel/i });
  }

  /** 等待弹窗打开 */
  async waitForOpen(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  /** 等待弹窗关闭 */
  async waitForClose(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }

  /** 获取标题 */
  async getTitle(): Promise<string | null> {
    return await this.title.textContent();
  }

  /** 关闭弹窗 */
  async close(): Promise<void> {
    await this.closeButton.click();
  }

  /** 点击确定 */
  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  /** 点击取消 */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /** 填写表单字段 */
  async fillField(label: string, value: string): Promise<void> {
    // Assuming standard labelled inputs
    await this.root.getByLabel(label).fill(value);
  }
}
