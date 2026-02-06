import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class StatisticsReportPage extends BasePage {
  readonly url = '/statistics/reports';

  // Filters
  readonly monthPicker: Locator;
  readonly dateRangeStart: Locator;
  readonly dateRangeEnd: Locator;
  readonly deptSelect: Locator;
  readonly searchButton: Locator;
  readonly exportButton: Locator;

  // Charts
  readonly dailyTrendChart: Locator;
  readonly statusDistributionChart: Locator;

  // Table
  readonly deptStatsTable: Locator;

  constructor(page: Page) {
    super(page);
    // Filters
    this.monthPicker = page.locator('input[type="month"]');
    this.dateRangeStart = page.locator('input[type="date"]').first();
    this.dateRangeEnd = page.locator('input[type="date"]').last();
    this.deptSelect = page.locator('select'); 
    // Buttons
    this.searchButton = page.getByRole('button', { name: '查询' });
    this.exportButton = page.getByRole('button', { name: '导出报表' });

    // Charts
    this.dailyTrendChart = page.getByText('每日出勤率趋势');
    this.statusDistributionChart = page.getByText('考勤状态分布');

    // Table
    this.deptStatsTable = page.locator('table');
  }

  async search(month?: string) {
    if (month) {
      await this.monthPicker.fill(month);
    }
    await this.searchButton.click();
  }

  async export() {
    await this.exportButton.click();
  }

  async verifyChartsVisible() {
    await expect(this.dailyTrendChart).toBeVisible();
    await expect(this.statusDistributionChart).toBeVisible();
  }

  async verifyTableData(deptNames: string[]) {
    for (const name of deptNames) {
      await expect(this.deptStatsTable).toContainText(name);
    }
  }

  async verifyEmptyTable() {
    await expect(this.deptStatsTable).toContainText('暂无数据');
  }
}
