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
    // 等待新增按钮出现，确保页面加载完成
    await expect(this.page.getByRole('button', { name: /新增/ })).toBeVisible({ timeout: 10000 });
  }

  async create(data: { name: string; startTime: string; endTime: string }) {
    await this.page.getByRole('button', { name: /新增/ }).click();
    const modal = this.page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // 填写表单
    await modal.getByLabel(/班次名称|Name/i).fill(data.name);
    
    // 填写时间 (Session 1)
    // 优先尝试通过 aria-label 定位
    const checkInInput = modal.getByLabel(/Session 1 Check-in/i);
    const checkOutInput = modal.getByLabel(/Session 1 Check-out/i);

    if (await checkInInput.count() > 0) {
      await checkInInput.fill(data.startTime);
      await checkOutInput.fill(data.endTime);
    } else {
      // Fallback: 如果没有 aria-label，尝试通过 input[type="time"]
      const timeInputs = modal.locator('input[type="time"]');
      if (await timeInputs.count() >= 2) {
        // 注意：ShiftModal 有多个时间输入，前两个应该是 check-in/out
        await timeInputs.nth(0).fill(data.startTime);
        await timeInputs.nth(1).fill(data.endTime);
      }
    }

    await modal.getByRole('button', { name: /确定|Confirm|保存|Save/i }).click();
    
    // 等待弹窗消失
    await expect(modal).not.toBeVisible();
    
    // 验证列表包含新班次
    await expect(this.table).toContainText(data.name);
  }
}
