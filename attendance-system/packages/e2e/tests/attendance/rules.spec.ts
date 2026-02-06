import { test, expect } from '../../fixtures';
import { AttendanceRulesPage } from '../../pages/attendance-rules.page';

test.describe('考勤制度 (SW62)', () => {
  let rulesPage: AttendanceRulesPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    rulesPage = new AttendanceRulesPage(authenticatedPage);
    await rulesPage.goto();
    await rulesPage.waitForLoad();
  });

  test.afterEach(async () => {
    // Restore defaults to avoid affecting other tests
    try {
      await rulesPage.updateSettings('05:00', '05:00');
      await rulesPage.expectSaveSuccess();
    } catch (e) {
      console.log('Failed to restore defaults:', e);
    }
  });

  test('修改考勤设置', async () => {
    const newDaySwitch = '06:30';
    const newAutoCalc = '03:45';
    await rulesPage.updateSettings(newDaySwitch, newAutoCalc);
    await rulesPage.expectSaveSuccess();
    
    // Wait for persistence
    await rulesPage.page.waitForTimeout(1000);

    // Reload to verify persistence
    await rulesPage.page.reload();
    await rulesPage.waitForLoad();
    await rulesPage.expectSettings(newDaySwitch, newAutoCalc);
  });
});
