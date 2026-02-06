import { test, expect } from '../../fixtures';
import { TimePeriodPage } from '../../pages/time-period.page';

test.describe('SW63 时间段设置', () => {
  let timePeriodPage: TimePeriodPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    timePeriodPage = new TimePeriodPage(authenticatedPage);
    await timePeriodPage.goto();
    await timePeriodPage.waitForLoad();
  });

  test('创建固定时间段', async ({ testData }) => {
    const name = `${testData.prefix}固定班-${Date.now()}`;
    await timePeriodPage.create({
      name,
      type: '固定班制',
      startTime: '09:00',
      endTime: '18:00',
      restStartTime: '12:00',
      restEndTime: '13:00'
    });
    await expect(timePeriodPage.table.findRowByText(name)).toBeVisible();
    
    // Cleanup
    await timePeriodPage.delete(name);
  });

  test('删除时间段', async ({ testData }) => {
    // Arrange
    const name = `${testData.prefix}删除测试-${Date.now()}`;
    await timePeriodPage.create({
      name,
      type: '固定班制',
      startTime: '09:00',
      endTime: '18:00'
    });
    await expect(timePeriodPage.table.findRowByText(name)).toBeVisible();

    // Act
    await timePeriodPage.delete(name);

    // Assert
    await expect(timePeriodPage.table.findRowByText(name)).not.toBeVisible();
  });
});
