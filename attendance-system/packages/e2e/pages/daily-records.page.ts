import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class DailyRecordsPage extends BasePage {
  readonly url = '/attendance/daily-records';

  // Filters
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly personnelInput: Locator; // Opens modal
  readonly statusSelect: Locator;
  readonly searchBtn: Locator;
  readonly resetBtn: Locator;

  // Header Actions
  readonly recalculateBtn: Locator;

  // Table
  readonly table: Locator;
  readonly tableRows: Locator;

  // Selection Modal
  readonly selectionModal: Locator;
  readonly selectionConfirmBtn: Locator;

  constructor(page: Page) {
    super(page);
    
    // Filters
    this.startDateInput = page.locator('input[type="date"]').first();
    this.endDateInput = page.locator('input[type="date"]').nth(1);
    this.personnelInput = page.getByPlaceholder('请选择部门或人员');
    this.statusSelect = page.locator('select'); // The only select on page
    
    this.searchBtn = page.getByRole('button', { name: '查询' });
    this.resetBtn = page.getByRole('button', { name: '重置' });

    // Actions
    this.recalculateBtn = page.getByRole('button', { name: '重新计算' });

    // Table
    this.table = page.locator('table');
    this.tableRows = this.table.locator('tbody tr');

    // Selection Modal
    this.selectionModal = page.getByRole('dialog', { name: '选择部门或人员' });
    this.selectionConfirmBtn = this.selectionModal.getByRole('button', { name: '确定' });
  }

  async triggerRecalculate(startDate: string, endDate: string) {
    // Handle native confirm dialog
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    await this.recalculateBtn.click();
    // Wait for toast or loading to disappear? 
    // The page shows loading state.
    // For now just wait a bit or verify toast if possible.
    // But since this method usually just triggers, we can let test assert the result.
    await this.page.waitForTimeout(1000); 
  }

  async search(name?: string, startDate?: string, endDate?: string) {
    if (startDate) await this.startDateInput.fill(startDate);
    if (endDate) await this.endDateInput.fill(endDate);
    
    if (name) {
      await this.personnelInput.click();
      await expect(this.selectionModal).toBeVisible();
      // Click the employee in the list
      await this.selectionModal.getByText(name, { exact: true }).click();
      await this.selectionConfirmBtn.click();
      await expect(this.selectionModal).toBeHidden();
    }
    
    await this.searchBtn.click();
    await this.page.waitForTimeout(500); // Wait for fetch
  }
}
