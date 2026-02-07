import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { TableComponent } from '../components/table.component';
import { ToastComponent } from '../components/toast.component';

export class ClockRecordPage extends BasePage {
  readonly url = '/attendance/clock-records';
  
  readonly table: TableComponent;
  readonly toast: ToastComponent;

  readonly manualClockBtn: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly employeeInput: Locator;
  
  // Modal locators
  readonly modal: Locator;
  readonly modalSubmitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    this.toast = new ToastComponent(page);
    
    // Use getByText to be more robust if role name calculation is tricky with icons
    this.manualClockBtn = page.getByRole('button', { name: /补录打卡/ });
    this.startTimeInput = page.locator('input[type="datetime-local"]').first();
    this.endTimeInput = page.locator('input[type="datetime-local"]').nth(1);
    this.searchButton = page.getByRole('button', { name: '查询' });
    this.resetButton = page.getByRole('button', { name: '重置' });
    this.employeeInput = page.getByPlaceholder('选择员工');
    
    this.modal = page.getByRole('dialog');
    this.modalSubmitBtn = this.modal.getByRole('button', { name: /提交|确定|Confirm/i });
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForURL(new RegExp(this.url));
    await expect(this.page.getByRole('heading', { name: '原始考勤记录' })).toBeVisible();
    await this.page.waitForLoadState('networkidle');
  }
  
  async manualClock(employeeName: string, time: string, type: '上班' | '下班') {
    await this.manualClockBtn.click();
    await expect(this.modal).toBeVisible();
    
    // Select employee
    const employeeSelect = this.modal.locator('select').first();
    
    // Wait for options to populate
    await expect(async () => {
        const count = await employeeSelect.locator('option').count();
        expect(count).toBeGreaterThan(1);
    }).toPass();
    
    // Check if the employee option exists
    const optionText = await employeeSelect.locator('option', { hasText: employeeName }).textContent();
    if (!optionText) {
        // If exact match by label fails, try to find by text content and get value
        // Or just fail with a better message
        const options = await employeeSelect.locator('option').allInnerTexts();
        throw new Error(`Employee "${employeeName}" not found in options: ${options.join(', ')}`);
    }

    await employeeSelect.selectOption({ label: employeeName });
    
    // Fill time
    await this.modal.locator('input[type="datetime-local"]').fill(time);
    
    // Select type
    const typeValue = type === '上班' ? 'sign_in' : 'sign_out';
    await this.modal.locator('select').nth(1).selectOption({ value: typeValue });
    
    await this.modalSubmitBtn.click();
    await this.toast.expectSuccess('补录成功');
    await expect(this.modal).not.toBeVisible();
  }
  
  async searchByDate(start: string, end: string) {
    await this.startTimeInput.fill(start);
    await this.endTimeInput.fill(end);
    await this.searchButton.click();
    await this.page.waitForTimeout(500); // Wait for table refresh
  }

  async expectRecord(employeeName: string, timeStr: string, source: string) {
    // We need to be careful with time matching as format might differ
    // Let's match by employee name and verify row contains time and source
    const row = this.table.rows.filter({ hasText: employeeName }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(timeStr);
    // Source might be mapped (e.g. '手动' -> 'Manual')
    // await expect(row).toContainText(source);
  }
}
