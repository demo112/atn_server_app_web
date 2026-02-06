import { Locator, Page } from '@playwright/test';

export class TableComponent {
  readonly root: Locator;
  readonly rows: Locator;
  readonly searchInput: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;

  constructor(protected page: Page, rootSelector = 'table') {
    this.root = page.locator(rootSelector);
    // Assuming standard table structure: tbody > tr
    // If rootSelector is not a table (e.g. a div wrapper), we might need to adjust
    this.rows = this.root.locator('tbody tr');
    
    // Common search and pagination locators - these might need adjustment based on specific UI implementation
    // Assuming search input is usually near the table or in a filter area
    this.searchInput = page.getByPlaceholder(/搜索|Search/i);
    
    // Pagination buttons
    this.prevButton = page.getByRole('button', { name: /上一页|Previous/i });
    this.nextButton = page.getByRole('button', { name: /下一页|Next/i });
  }

  /** 获取数据行数 */
  async getDataRowCount(): Promise<number> {
    await this.rows.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    return await this.rows.count();
  }

  /** 根据文本查找行 */
  findRowByText(text: string): Locator {
    return this.rows.filter({ hasText: text });
  }

  /** 点击行内操作按钮 */
  async clickRowAction(rowText: string, actionName: string): Promise<void> {
    const row = this.findRowByText(rowText);
    await row.getByRole('button', { name: actionName }).click();
  }

  /** 搜索 */
  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
    // Trigger search usually by Enter or typing
    await this.searchInput.press('Enter');
    // Wait for table to update - naive approach, better to wait for loading state if available
    await this.page.waitForTimeout(500); 
  }

  /** 下一页 */
  async nextPage(): Promise<void> {
    await this.nextButton.click();
  }

  /** 上一页 */
  async prevPage(): Promise<void> {
    await this.prevButton.click();
  }
}
