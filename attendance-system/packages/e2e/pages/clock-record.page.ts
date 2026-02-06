import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { ModalComponent } from '../components/modal.component';
import { TableComponent } from '../components/table.component';
import { ToastComponent } from '../components/toast.component';

export class ClockRecordPage extends BasePage {
  readonly url = '/attendance/clock-records';
  
  readonly modal: ModalComponent;
  readonly table: TableComponent;
  readonly toast: ToastComponent;

  readonly manualClockBtn: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = new ModalComponent(page);
    this.table = new TableComponent(page);
    this.toast = new ToastComponent(page);
    
    this.manualClockBtn = page.getByRole('button', { name: '补录打卡' });
    this.startTimeInput = page.locator('input[type="datetime-local"]').first();
    this.endTimeInput = page.locator('input[type="datetime-local"]').nth(1);
    this.searchButton = page.getByRole('button', { name: '查询' });
  }

  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForURL(new RegExp(this.url));
  }
  
  async manualClock(employeeName: string, time: string, type: '上班' | '下班') {
    await this.manualClockBtn.click();
    await this.modal.waitForOpen();
    
    const selects = this.modal.root.locator('select');
    await selects.first().selectOption({ label: employeeName });
    await this.modal.root.locator('input[type="datetime-local"]').fill(time);
    await selects.nth(1).selectOption({ label: type });
    
    await this.modal.confirm();
    await this.toast.expectSuccess('补录成功');
    await this.modal.waitForClose();
  }
  
  async expectRecord(employeeName: string, timeStr: string, source: string) {
    await expect(
      this.table.rows.filter({ hasText: employeeName }).filter({ hasText: timeStr }).filter({ hasText: source })
    ).toBeVisible();
  }
}
