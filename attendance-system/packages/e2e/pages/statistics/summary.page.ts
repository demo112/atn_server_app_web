import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';
import { TableComponent } from '../../components/table.component';

export class SummaryPage extends BasePage {
  readonly url = '/statistics/summary';
  readonly table: TableComponent;

  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly deptSelect: Locator;
  readonly queryButton: Locator;
  readonly exportButton: Locator;
  readonly recalcButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);

    this.startDateInput = page.locator('input[type="date"]').first();
    this.endDateInput = page.locator('input[type="date"]').last();
    // Assuming dept select is the first select on the page or has a specific identifier
    // In React component: <select className="input" value={selectedDept} ...>
    this.deptSelect = page.locator('select');
    
    this.queryButton = page.getByRole('button', { name: '查询' });
    this.exportButton = page.getByRole('button', { name: '导出' });
    this.recalcButton = page.getByRole('button', { name: '重新计算' });
  }

  async setDateRange(start: string, end: string) {
    await this.startDateInput.fill(start);
    await this.endDateInput.fill(end);
  }

  async selectDepartment(deptId: string) {
    await this.deptSelect.selectOption(deptId);
  }

  async clickQuery() {
    await this.queryButton.click();
  }

  async clickExport() {
    await this.exportButton.click();
  }

  async clickRecalc() {
    await this.recalcButton.click();
  }

  async expectDataLoaded() {
    await this.table.waitForLoaded();
  }

  async expectEmptyData() {
    await expect(this.page.getByText('暂无数据')).toBeVisible();
  }
}
