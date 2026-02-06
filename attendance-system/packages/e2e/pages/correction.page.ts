import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CorrectionPage extends BasePage {
  readonly url = '/attendance/correction';

  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  
  readonly tableRows: Locator;
  readonly editModal: Locator;

  constructor(page: Page) {
    super(page);
    this.startDateInput = page.locator('input[type="date"]').nth(0); // 假设第一个是开始日期
    this.endDateInput = page.locator('input[type="date"]').nth(1);   // 假设第二个是结束日期
    this.searchButton = page.getByRole('button', { name: '查询' });
    this.resetButton = page.getByRole('button', { name: '重置' });
    
    this.tableRows = page.locator('tbody tr');
    this.editModal = page.getByRole('dialog');
  }

  async search(startDate?: string, endDate?: string) {
    if (startDate) await this.startDateInput.fill(startDate);
    if (endDate) await this.endDateInput.fill(endDate);
    await this.searchButton.click();
    await this.waitForLoad();
  }

  async openEdit(rowIndex: number = 0) {
    await this.tableRows.nth(rowIndex).getByRole('button', { name: '编辑' }).click();
    await expect(this.editModal).toBeVisible();
  }

  async submitEdit(reason: string) {
    await this.editModal.getByLabel('补签原因').fill(reason);
    await this.editModal.getByRole('button', { name: '确定' }).click();
    await expect(this.editModal).toBeHidden();
  }

  async expectRowContent(rowIndex: number, text: string) {
    await expect(this.tableRows.nth(rowIndex)).toContainText(text);
  }
}
