import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class StatisticsDashboardPage extends BasePage {
  readonly url = '/statistics/dashboard';

  constructor(page: Page) {
    super(page);
  }

  async navigateTo(reportType: '每日统计表' | '月度汇总表' | '月度卡表') {
    if (reportType === '每日统计表') {
       await this.page.locator('text=每日统计表').click();
    } else if (reportType === '月度汇总表') {
        await this.page.getByText('汇总表', { exact: true }).click();
    } else if (reportType === '月度卡表') {
        await this.page.getByText('卡表', { exact: true }).click();
    } else {
         await this.page.getByText('每日', { exact: true }).first().click();
    }
  }
  
  async clickCard(titleSecondary: string) {
      const card = this.page.locator(`div`).filter({ hasText: titleSecondary }).last();
      await card.getByRole('button', { name: '查看/导出' }).click();
  }
}
