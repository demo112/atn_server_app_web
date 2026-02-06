import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class AttendanceRulesPage extends BasePage {
  readonly url = '/attendance/settings';
  readonly daySwitchTimeInput: Locator;
  readonly autoCalcTimeInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.daySwitchTimeInput = page.getByLabel('考勤日切换时间');
    this.autoCalcTimeInput = page.getByLabel('自动计算时间');
    this.saveButton = page.getByRole('button', { name: '保存配置' });
  }

  async updateSettings(daySwitchTime: string, autoCalcTime: string): Promise<void> {
    await this.daySwitchTimeInput.fill(daySwitchTime);
    await this.autoCalcTimeInput.fill(autoCalcTime);
    await this.saveButton.click();
  }
  
  async expectSaveSuccess(): Promise<void> {
      await expect(this.page.getByText('保存成功')).toBeVisible();
  }

  async expectSettings(daySwitchTime: string, autoCalcTime: string): Promise<void> {
      await expect(this.daySwitchTimeInput).toHaveValue(daySwitchTime);
      await expect(this.autoCalcTimeInput).toHaveValue(autoCalcTime);
  }
}
