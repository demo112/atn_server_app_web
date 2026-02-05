import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ClockRecordPage extends BasePage {
  readonly url = '/attendance/clock-records';
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.startTimeInput = page.locator('input[type="datetime-local"]').first();
    this.endTimeInput = page.locator('input[type="datetime-local"]').nth(1);
    this.searchButton = page.locator('button', { hasText: '查询' });
  }

  async goto() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(new RegExp(this.url));
    await expect(this.searchButton).toBeVisible();
  }
}
