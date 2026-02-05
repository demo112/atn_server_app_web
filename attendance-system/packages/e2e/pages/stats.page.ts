import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class StatsPage extends BasePage {
  readonly url = '/statistics/daily-stats';

  // Navigation
  readonly navDailyStats = '/statistics/daily-stats';
  readonly navMonthlyCard = '/statistics/monthly-card-report';
  readonly navMonthlySummary = '/statistics/monthly-summary-report';

  // Common Elements
  readonly recalcButton: Locator;
  
  // Daily Stats Specific
  readonly dailyStartDateInput: Locator;
  readonly dailyEndDateInput: Locator;
  readonly dailySearchButton: Locator;
  readonly totalRecordsText: Locator;
  readonly nextPageButton: Locator;
  readonly prevPageButton: Locator;
  readonly pageSizeSelect: Locator;

  // Standard Modal Elements (for Monthly Reports)
  readonly modal: Locator;
  readonly modalStartDateInput: Locator;
  readonly modalEndDateInput: Locator;
  readonly modalConfirmButton: Locator;
  readonly modalCancelButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Common
    this.recalcButton = page.getByRole('button', { name: '考勤计算' });

    // Daily Stats - Page Level Inputs
    // Using simple CSS selectors based on the code analysis (inputs inside the grid)
    // The code shows: <label>开始日期</label><input type="date" ... />
    // We can use getByLabel if labels are associated, otherwise use layout selectors
    this.dailyStartDateInput = page.locator('input[type="date"]').first();
    this.dailyEndDateInput = page.locator('input[type="date"]').nth(1);
    this.dailySearchButton = page.getByRole('button', { name: '查询' });
    
    // Pagination (Daily Stats)
    // "共 123 条记录"
    this.totalRecordsText = page.locator('text=/共 \\d+ 条记录/');
    this.nextPageButton = page.locator('button:has(span:text("chevron_right"))');
    this.prevPageButton = page.locator('button:has(span:text("chevron_left"))');
    this.pageSizeSelect = page.locator('select').last(); // Assuming it's the last select on page

    // Standard Modal (Monthly Reports)
    this.modal = page.locator('[role="dialog"]');
    // Inside modal, there are date inputs. 
    // We assume they are the first and second date inputs inside the modal
    this.modalStartDateInput = this.modal.locator('input[type="date"]').first();
    this.modalEndDateInput = this.modal.locator('input[type="date"]').nth(1);
    this.modalConfirmButton = this.modal.getByRole('button', { name: '开始重算' });
    this.modalCancelButton = this.modal.getByRole('button', { name: '取消' });
  }

  async gotoDailyStats() {
    await this.page.goto(this.navDailyStats);
  }

  async gotoMonthlyCard() {
    await this.page.goto(this.navMonthlyCard);
  }

  async gotoMonthlySummary() {
    await this.page.goto(this.navMonthlySummary);
  }

  /**
   * Click Recalculate button.
   * For Daily Stats, this triggers window.alert immediately (success or fail).
   * For Monthly Reports, this opens a Modal.
   */
  async clickRecalculate() {
    await this.recalcButton.click();
  }

  /**
   * Handle the alert dialog for Daily Stats recalculation
   */
  async handleRecalcAlert(expectedMessage: string) {
    const dialogPromise = this.page.waitForEvent('dialog');
    await this.recalcButton.click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain(expectedMessage);
    await dialog.accept();
  }

  /**
   * Fill and submit the recalculation modal (for Monthly reports)
   */
  async submitRecalcModal(start: string, end: string) {
    await expect(this.modal).toBeVisible();
    await this.modalStartDateInput.fill(start);
    await this.modalEndDateInput.fill(end);
    await this.modalConfirmButton.click();
  }

  /**
   * Expect total records text to match a regex or number
   */
  async expectTotalRecords(count: number | RegExp) {
    if (typeof count === 'number') {
      await expect(this.totalRecordsText).toContainText(`${count}`);
    } else {
      await expect(this.totalRecordsText).toHaveText(count);
    }
  }
}
