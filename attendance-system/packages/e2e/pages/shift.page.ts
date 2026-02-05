import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ShiftPage extends BasePage {
  readonly url = '/attendance/shifts';
  readonly table: Locator;
  readonly pagination: Locator;
  readonly icons: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('table');
    this.pagination = page.locator('footer');
    this.icons = page.locator('.material-symbols-outlined');
  }

  async goto() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(new RegExp(this.url));
  }
}
