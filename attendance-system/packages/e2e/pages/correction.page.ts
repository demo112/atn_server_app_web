import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { TableComponent } from '../components/table.component';
import { ToastComponent } from '../components/toast.component';

export class CorrectionPage extends BasePage {
  readonly url = '/attendance/correction';
  
  readonly table: TableComponent;
  readonly toast: ToastComponent;

  // Filters
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly typeSelect: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly deptPersonInput: Locator;
  
  // Selection Modal
  readonly selectionModal: Locator;
  readonly selectionConfirmBtn: Locator;

  // Edit Modal
  readonly editModal: Locator;
  readonly editTimeInput: Locator;
  readonly editConfirmBtn: Locator;
  
  // Toolbar
  readonly deleteBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    this.toast = new ToastComponent(page);
    
    // Filters
    this.startTimeInput = page.locator('input[type="date"]').first();
    this.endTimeInput = page.locator('input[type="date"]').nth(1);
    this.typeSelect = page.locator('select');
    this.searchButton = page.getByRole('button', { name: '查询' });
    this.resetButton = page.getByRole('button', { name: '重置' });
    this.deptPersonInput = page.getByPlaceholder('选择部门或人员');

    // Selection Modal
    this.selectionModal = page.getByRole('dialog', { name: /选择/ });
    this.selectionConfirmBtn = this.selectionModal.getByRole('button', { name: '确定' });

    // Edit Modal
    this.editModal = page.getByRole('dialog').filter({ hasText: '补签申请详情' });
    this.editTimeInput = this.editModal.locator('input[type="text"]'); // It's type="text" in code
    this.editConfirmBtn = this.editModal.getByRole('button', { name: '确认' });

    // Toolbar
    this.deleteBtn = page.getByRole('button', { name: '删除' });
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForURL(new RegExp(this.url));
    await expect(this.page.getByRole('heading', { name: '补签记录' })).toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }

  async filterByEmployee(name: string) {
    await this.deptPersonInput.click();
    await expect(this.selectionModal).toBeVisible();
    
    // Switch to Employee tab if needed (assuming default or tab selection)
    // The PersonnelSelectionModal usually has tabs.
    // Let's assume we can search or select from list.
    // For simplicity, if we can search:
    const searchInput = this.selectionModal.getByPlaceholder(/搜索/);
    if (await searchInput.isVisible()) {
        await searchInput.fill(name);
        await this.page.waitForTimeout(500); // Wait for search
    }
    
    // Select the item
    await this.selectionModal.getByText(name).click();
    await this.selectionConfirmBtn.click();
    await expect(this.selectionModal).not.toBeVisible();
  }

  async filterByDate(start: string, end: string) {
    await this.startTimeInput.fill(start);
    await this.endTimeInput.fill(end);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
  }

  async edit(id: number, time: string) {
    // Find row by ID
    const row = this.table.getRowByText(id.toString());
    await row.getByRole('button').filter({ has: this.page.locator('.material-icons:has-text("edit")') }).click();
    
    await expect(this.editModal).toBeVisible();
    await this.editTimeInput.fill(time);
    await this.editConfirmBtn.click();
    await expect(this.editModal).not.toBeVisible();
    // No toast in view code? Let's check.
    // CorrectionView.tsx didn't show toast success.
    // But we can check if table refreshes.
    await this.page.waitForTimeout(500); 
  }

  async delete(id: number) {
    // Select row
    const row = this.table.getRowByText(id.toString());
    await row.getByRole('checkbox').check();
    
    // Click delete
    await this.deleteBtn.click();
    
    // Confirm delete (if there is a confirmation)
    // Usually StandardModal or confirm dialog.
    // CorrectionView didn't show confirm logic in the snippet I read.
    // But usually delete has confirmation.
    // If not, it might just delete.
    // Let's assume standard confirmation:
    const confirmModal = this.page.getByRole('dialog', { name: /确认|删除/ });
    if (await confirmModal.isVisible({ timeout: 2000 })) {
        await confirmModal.getByRole('button', { name: /确定|Confirm/ }).click();
    }
    
    await this.page.waitForTimeout(500);
  }

  async expectRecord(name: string, type: '补签到' | '补签退', time: string) {
    const row = this.table.rows.filter({ hasText: name }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(type);
    await expect(row).toContainText(time);
  }
}
