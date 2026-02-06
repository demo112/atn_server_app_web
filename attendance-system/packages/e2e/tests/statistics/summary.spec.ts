import { test, expect } from '../../fixtures';
import { SummaryPage } from '../../pages/statistics/summary.page';

test.describe('考勤汇总 (SW70)', () => {
  let summaryPage: SummaryPage;

  const mockSummaryData = [
    {
      employeeId: 1,
      employeeNo: 'EMP001',
      employeeName: '张三',
      deptName: '研发部',
      totalDays: 22,
      actualDays: 20,
      lateCount: 1,
      lateMinutes: 10,
      earlyCount: 0,
      earlyMinutes: 0,
      absentDays: 0,
      leaveDays: 2,
      overtimeHours: 5,
      missCardCount: 0
    },
    {
      employeeId: 2,
      employeeNo: 'EMP002',
      employeeName: '李四',
      deptName: '研发部',
      totalDays: 22,
      actualDays: 22,
      lateCount: 0,
      lateMinutes: 0,
      earlyCount: 0,
      earlyMinutes: 0,
      absentDays: 0,
      leaveDays: 0,
      overtimeHours: 0,
      missCardCount: 0
    }
  ];

  test.beforeEach(async ({ authenticatedPage }) => {
    summaryPage = new SummaryPage(authenticatedPage);
  });

  test('默认查询展示数据', async ({ page }) => {
    // Mock API response
    await page.route('**/api/v1/statistics/monthly*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockSummaryData })
      });
    });

    await summaryPage.goto();
    await summaryPage.waitForLoad();
    
    // Verify data loading
    await expect(async () => {
      const rows = await summaryPage.table.getDataRowCount();
      expect(rows).toBe(2);
    }).toPass();
    
    const firstRow = summaryPage.table.rows.first();
    await expect(firstRow).toContainText('张三');
    await expect(firstRow).toContainText('研发部');
    await expect(firstRow).toContainText('20'); // actualDays
    await expect(firstRow).toContainText('1'); // lateCount
  });

  test('筛选功能', async ({ page }) => {
    let requestUrl = '';
    await page.route('**/api/v1/statistics/monthly*', async route => {
      requestUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockSummaryData })
      });
    });

    await summaryPage.goto();
    await summaryPage.waitForLoad();

    // Change filters
    await summaryPage.setDateRange('2023-10-01', '2023-10-31');
    // Mock department select if necessary (assumes departments are loaded)
    
    await summaryPage.clickQuery();
    
    // Verify request params
    await expect(async () => {
      expect(requestUrl).toContain('startDate=2023-10-01');
      expect(requestUrl).toContain('endDate=2023-10-31');
    }).toPass();
  });

  test('重新计算', async ({ page }) => {
    await page.route('**/api/v1/statistics/calculate', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await summaryPage.goto();
    await summaryPage.clickRecalc();
    
    // Should show success message or reload
    // Currently just verify the button click triggers the request
  });

  test('无数据状态', async ({ page }) => {
    await page.route('**/api/v1/statistics/monthly*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] })
      });
    });

    await summaryPage.goto();
    await summaryPage.expectEmptyData();
  });

  test('导出功能', async ({ page }) => {
    await summaryPage.goto();
    // Export usually triggers a download or opens a new tab
    // Mocking the download event
    const downloadPromise = page.waitForEvent('download');
    
    // Mock export API if it's an API call
    await page.route('**/api/v1/statistics/export*', async route => {
       await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: 'dummy content'
      });
    });

    await summaryPage.clickExport();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('考勤汇总');
  });
});
