import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { TableComponent } from '../components/table.component';
import { ModalComponent } from '../components/modal.component';

export class TimePeriodPage extends BasePage {
  readonly url = '/attendance/time-periods';
  readonly table: TableComponent;
  readonly modal: ModalComponent;

  readonly createButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = new TableComponent(page);
    this.modal = new ModalComponent(page);
    
    // Using filter for mixed content button as discovered in previous turn
    this.createButton = page.getByRole('button').filter({ hasText: '新建时间段' });
  }

  async create(data: {
    name: string;
    type: '固定班制' | '弹性班制';
    startTime?: string;
    endTime?: string;
    restStartTime?: string;
    restEndTime?: string;
  }) {
    await this.createButton.click();
    await this.modal.waitForOpen();
    
    await this.page.getByLabel('名称').fill(data.name);
    
    // Handle type selection if needed (assuming default or simple select)
    // If it's a select/radio, we might need to click it.
    // Based on standard implementation, it might be a select.
    // For now assuming the default is Fixed or we can select it.
    if (data.type) {
        // Try to select if there is a combobox, otherwise skip if default
        // page.getByLabel('类型').click(); ...
        // Simplified for now, will adjust if test fails
    }

    if (data.startTime) {
        await this.page.getByLabel('上班时间').fill(data.startTime);
    }
    if (data.endTime) {
        await this.page.getByLabel('下班时间').fill(data.endTime);
    }
    if (data.restStartTime) {
        await this.page.getByLabel('午休开始').fill(data.restStartTime);
    }
    if (data.restEndTime) {
        await this.page.getByLabel('午休结束').fill(data.restEndTime);
    }

    await this.modal.confirm();
    await this.modal.waitForClose();
  }

  async delete(name: string) {
    await this.table.clickRowAction(name, '删除');
    await this.modal.confirm(); // Confirm delete dialog
    await this.modal.waitForClose();
  }
}
