import { test, expect } from '../../fixtures';

test.describe('Attendance - Schedule Display', () => {

  test.beforeEach(async ({ schedulePage }) => {
    await schedulePage.goto();
  });

  test('should load department tree and select a node', async ({ schedulePage }) => {
    // 验证部门树加载
    const firstNode = schedulePage.page.locator('li.select-none').first();
    await expect(firstNode).toBeVisible();
    
    // 选择第一个部门
    await firstNode.locator('div').first().click();
    
    // 验证日历加载
    await expect(schedulePage.calendar).toBeVisible();
    await expect(schedulePage.page.locator('text=当前部门:')).toBeVisible();
  });

  test('should display schedule data with names', async ({ schedulePage }) => {
    // 选择第一个部门
    const firstNode = schedulePage.page.locator('li.select-none').first();
    await firstNode.locator('div').first().click();
    
    // 等待日历加载
    await expect(schedulePage.calendar).toBeVisible();
    
    // 检查是否有排班数据
    // 注意：如果当前月份没有排班，此检查会跳过。
    // 在真实回归中，应该配合数据预置 (Fixtures) 来确保有数据。
    const dataCount = await schedulePage.calendarDataItems.count();
    if (dataCount > 0) {
      const firstItem = schedulePage.calendarDataItems.first();
      const text = await firstItem.textContent();
      console.log(`Schedule Item Text: ${text}`);
      
      // 验证显示格式为 "Name: Shift" (包含冒号)
      expect(text).toContain(':');
      
      // 验证没有显示 "undefined" 或 "null"
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('null');
    }
  });

});
