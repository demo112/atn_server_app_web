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
    // 匹配 "新建班次" 或 "新增班次"
    await expect(this.page.getByRole('button', { name: /新建|新增/ })).toBeVisible({ timeout: 10000 });
  }

  async create(data: { name: string; startTime: string; endTime: string }) {
    await this.page.getByRole('button', { name: /新建|新增/ }).click();
    const modal = this.page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // 填写表单
    await modal.getByLabel(/班次名称|Name/i).fill(data.name);
    
    // 填写时间 (Session 1)
    // 使用 aria-label 定位
    await modal.getByLabel('Session 1 Check-in').fill(data.startTime);
    await modal.getByLabel('Session 1 Check-out').fill(data.endTime);

    // 监听创建和刷新请求
    const createPromise = this.page.waitForResponse(resp => 
        resp.url().includes('/api/v1/attendance/shifts') && resp.request().method() === 'POST'
    );
    const refreshPromise = this.page.waitForResponse(resp => 
        resp.url().includes('/api/v1/attendance/shifts') && resp.request().method() === 'GET'
    );

    await modal.getByRole('button', { name: /确定|Confirm|保存|Save/i }).click();
    
    // 验证请求成功
    const createResp = await createPromise;
    expect(createResp.ok()).toBeTruthy();
    
    const refreshResp = await refreshPromise;
    expect(refreshResp.ok()).toBeTruthy();
    
    // 等待弹窗消失
    await expect(modal).not.toBeVisible();
    
    // 验证列表包含新班次
    await expect(this.table).toContainText(data.name);
  }

  async edit(oldName: string, newData: { name: string }) {
    // 找到包含名称的行
    const row = this.table.locator('tr', { hasText: oldName });
    await expect(row).toBeVisible();
    
    // 点击编辑按钮
    await row.getByTitle('编辑').click();
    
    const modal = this.page.getByRole('dialog');
    await expect(modal).toBeVisible();
    // await expect(modal).toContainText('编辑班次');
    
    // 更新表单
    await modal.getByLabel(/班次名称|Name/i).fill(newData.name);
    
    // 监听更新和刷新请求
    const updatePromise = this.page.waitForResponse(resp => 
        resp.url().includes('/api/v1/attendance/shifts') && resp.request().method() === 'PUT'
    );
    const refreshPromise = this.page.waitForResponse(resp => 
        resp.url().includes('/api/v1/attendance/shifts') && resp.request().method() === 'GET'
    );

    await modal.getByRole('button', { name: /确定|Confirm|保存|Save/i }).click();
    
    // 验证请求成功
    const updateResp = await updatePromise;
    expect(updateResp.ok()).toBeTruthy();
    
    const refreshResp = await refreshPromise;
    expect(refreshResp.ok()).toBeTruthy();
    
    // 等待弹窗消失
    await expect(modal).not.toBeVisible();
    
    // 验证列表更新
    await expect(this.table).toContainText(newData.name);
    if (oldName !== newData.name) {
        await expect(this.table).not.toContainText(oldName);
    }
  }

  async delete(name: string) {
    // 找到包含名称的行
    const row = this.table.locator('tr', { hasText: name });
    await expect(row).toBeVisible();
    
    // 点击删除按钮
    await row.getByTitle('删除').click();
    
    // 确认删除
    const confirmModal = this.page.locator('[role="dialog"]').filter({ hasText: /确认|删除/ });
    await expect(confirmModal).toBeVisible();
    
    // 监听删除请求
    const deletePromise = this.page.waitForResponse(resp => 
        resp.url().includes('/api/v1/attendance/shifts') && resp.request().method() === 'DELETE'
    );

    // 监听列表刷新请求
    const refreshPromise = this.page.waitForResponse(resp => 
        resp.url().includes('/api/v1/attendance/shifts') && resp.request().method() === 'GET'
    );

    await confirmModal.getByRole('button', { name: /确定|Confirm|删除|Delete/i }).click();
    
    // 等待请求完成
    const deleteResp = await deletePromise;
    if (!deleteResp.ok()) {
      console.log(`Delete failed: ${deleteResp.status()} ${await deleteResp.text()}`);
    }
    expect(deleteResp.ok()).toBeTruthy();

    const refreshResp = await refreshPromise;
    expect(refreshResp.ok()).toBeTruthy();

    // 验证删除成功
    await expect(row).not.toBeVisible();
  }
}
