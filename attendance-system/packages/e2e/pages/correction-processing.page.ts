import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { TableComponent } from '../components/table.component';
import { ModalComponent } from '../components/modal.component';

export class CorrectionProcessingPage extends BasePage {
  readonly url = '/attendance/correction-processing';
  readonly table: TableComponent;
  
  // Filters
  readonly statusSelect: Locator;
  readonly searchInput: Locator; // If there is a search input, though UI showed start/end date mostly.
  // There is a filter area but standard components might differ. 
  // Based on code:
  // <input value={params.startDate} ... />
  // <select value={params.status} ... />
  
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;

  // Dialogs
  readonly checkInDialog: Locator;
  readonly checkOutDialog: Locator;
  readonly dialogTimeInput: Locator;
  readonly dialogRemarkInput: Locator;
  readonly dialogSubmitBtn: Locator;
  
  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    
    // Filters
    this.statusSelect = page.locator('select').filter({ hasText: '全部异常' }).or(page.locator('select').filter({ hasText: '所有记录' }));
    // A bit loose, maybe by class or just first select if unique
    this.startDateInput = page.locator('input[type="date"]').first();
    this.endDateInput = page.locator('input[type="date"]').nth(1);
    
    // Dialogs
    this.checkInDialog = page.getByRole('dialog').filter({ hasText: '补签申请' });
    this.checkOutDialog = page.getByRole('dialog').filter({ hasText: '补签申请' });
    
    this.dialogTimeInput = page.locator('input[type="datetime-local"]');
    this.dialogRemarkInput = page.locator('textarea');
    this.dialogSubmitBtn = page.getByRole('button', { name: /确认提交|提交中/ });
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async filterByStatus(statusLabel: string) {
    await this.statusSelect.selectOption({ label: statusLabel });
    await this.waitForLoad();
  }

  async openCheckIn(employeeName: string) {
    // Find row by employee name, then click check-in button
    // The table structure in standard TableComponent usually has rows.
    // If not using standard table, might be tricky.
    // Assuming standard table:
    await this.table.getRowByText(employeeName).getByRole('button', { name: '补签到' }).click();
  }

  async openCheckOut(employeeName: string) {
    await this.table.getRowByText(employeeName).getByRole('button', { name: '补签退' }).click();
  }

  async submitCheckIn(time: string, remark: string) {
    await this.dialogTimeInput.fill(time); // format: YYYY-MM-DDTHH:mm
    if (remark) {
      await this.dialogRemarkInput.fill(remark);
    }
    await this.dialogSubmitBtn.click();
    await this.expectToast('补签到成功');
  }

  async submitCheckOut(time: string, remark: string) {
    await this.dialogTimeInput.fill(time);
    if (remark) {
      await this.dialogRemarkInput.fill(remark);
    }
    await this.dialogSubmitBtn.click();
    await this.expectToast('补签退成功');
  }
}
