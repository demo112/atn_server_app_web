import { test, expect } from '../../fixtures';
import { AttendanceSettingsPage } from '../../pages/attendance-settings.page';

test.describe('SW62 考勤制度设置', () => {
  let settingsPage: AttendanceSettingsPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    settingsPage = new AttendanceSettingsPage(authenticatedPage);
    await settingsPage.goto();
    await settingsPage.waitForLoad();
  });

  test('加载设置 - 显示默认值', async () => {
    await expect(settingsPage.daySwitchTimeInput).not.toBeEmpty();
    await expect(settingsPage.autoCalcTimeInput).not.toBeEmpty();
  });

  test('修改设置 - 成功保存并回显', async () => {
    const newTime = '06:00';
    const newCalcTime = '03:00';

    await settingsPage.setDaySwitchTime(newTime);
    await settingsPage.setAutoCalcTime(newCalcTime);
    await settingsPage.save();

    await settingsPage.expectSuccessMessage();

    await settingsPage.page.reload();
    await settingsPage.waitForLoad();
    await expect(settingsPage.daySwitchTimeInput).toHaveValue(newTime);
    await expect(settingsPage.autoCalcTimeInput).toHaveValue(newCalcTime);
    
    // 恢复默认
    await settingsPage.setDaySwitchTime('05:00');
    await settingsPage.setAutoCalcTime('04:00');
    await settingsPage.save();
    await settingsPage.expectSuccessMessage();
  });

  test('必填校验 - 浏览器验证', async () => {
    await settingsPage.daySwitchTimeInput.fill('');
    await settingsPage.save();
    
    const validationMessage = await settingsPage.daySwitchTimeInput.evaluate((e: HTMLInputElement) => e.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});
