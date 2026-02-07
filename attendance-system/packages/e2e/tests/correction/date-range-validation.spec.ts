import { test, expect } from '../../fixtures';
import { CorrectionProcessingPage } from '../../pages/correction-processing.page';

test.describe('补签处理日期选择验证', () => {
  let correctionPage: CorrectionProcessingPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    correctionPage = new CorrectionProcessingPage(authenticatedPage);
    await correctionPage.goto();
    await correctionPage.waitForLoad();
  });

  test('验证开始时间和结束时间的约束', async () => {
    // 1. 设置开始时间
    const startDate = '2026-02-10';
    await correctionPage.startDateInput.fill(startDate);
    
    // 验证结束时间的 min 属性被设置为开始时间
    await expect(correctionPage.endDateInput).toHaveAttribute('min', startDate);

    // 2. 尝试设置结束时间早于开始时间
    const earlyDate = '2026-02-05';
    await correctionPage.endDateInput.fill(earlyDate);
    
    // 验证开始时间自动更新为结束时间
    await expect(correctionPage.startDateInput).toHaveValue(earlyDate);
    await expect(correctionPage.endDateInput).toHaveValue(earlyDate);

    // 3. 设置结束时间为一个较晚的日期
    const endDate = '2026-02-20';
    await correctionPage.endDateInput.fill(endDate);

    // 验证开始时间的 max 属性被设置为结束时间
    await expect(correctionPage.startDateInput).toHaveAttribute('max', endDate);

    // 4. 尝试设置开始时间晚于结束时间
    const lateDate = '2026-02-25';
    await correctionPage.startDateInput.fill(lateDate);

    // 验证结束时间自动更新为开始时间
    await expect(correctionPage.startDateInput).toHaveValue(lateDate);
    await expect(correctionPage.endDateInput).toHaveValue(lateDate);
  });
});
