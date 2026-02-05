import { test, expect } from '../../fixtures';

test.describe('Statistics - Recalculation & Reports', () => {

  test('Daily Stats: should trigger recalculation and show success alert', async ({ statsPage }) => {
    await statsPage.gotoDailyStats();
    
    // Ensure inputs are populated
    await expect(statsPage.dailyStartDateInput).not.toHaveValue('');
    
    // 验证考勤计算按钮交互
    // Daily Stats 使用 window.alert
    const dialogPromise = statsPage.page.waitForEvent('dialog');
    await statsPage.clickRecalculate();
    const dialog = await dialogPromise;
    
    console.log(`Dialog message: ${dialog.message()}`);
    expect(dialog.message()).toContain('考勤重算已触发');
    await dialog.accept();
  });

  test('Daily Stats: should display total records and pagination', async ({ statsPage }) => {
    await statsPage.gotoDailyStats();
    
    // 验证总记录数显示
    // 假设数据库有数据，如果没有数据，显示 "共 0 条记录"
    await expect(statsPage.totalRecordsText).toBeVisible();
    
    // 验证分页控件存在
    await expect(statsPage.pageSizeSelect).toBeVisible();
  });

  test('Monthly Card: should trigger recalculation via modal', async ({ statsPage }) => {
    await statsPage.gotoMonthlyCard();
    await statsPage.clickRecalculate();
    
    // 验证模态框弹出
    await expect(statsPage.modal).toBeVisible();
    
    // 填写日期并确认
    const today = new Date().toISOString().split('T')[0];
    await statsPage.modalStartDateInput.fill(today);
    await statsPage.modalEndDateInput.fill(today);
    
    // 监听后续的 Alert
    const dialogPromise = statsPage.page.waitForEvent('dialog');
    await statsPage.modalConfirmButton.click();
    const dialog = await dialogPromise;
    
    expect(dialog.message()).toContain('考勤重算已触发');
    await dialog.accept();
    
    // 验证模态框关闭
    await expect(statsPage.modal).toBeHidden();
  });

  test('Monthly Summary: should trigger recalculation via modal', async ({ statsPage }) => {
    await statsPage.gotoMonthlySummary();
    await statsPage.clickRecalculate();
    
    // 验证模态框弹出
    await expect(statsPage.modal).toBeVisible();
    
    // 填写日期并确认
    const today = new Date().toISOString().split('T')[0];
    await statsPage.modalStartDateInput.fill(today);
    await statsPage.modalEndDateInput.fill(today);
    
    // 监听后续的 Alert
    const dialogPromise = statsPage.page.waitForEvent('dialog');
    await statsPage.modalConfirmButton.click();
    const dialog = await dialogPromise;
    
    expect(dialog.message()).toContain('考勤重算已触发');
    await dialog.accept();
    
    // 验证模态框关闭
    await expect(statsPage.modal).toBeHidden();
  });

});
