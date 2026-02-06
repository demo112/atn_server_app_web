import { test, expect } from '../../fixtures';
import { StatisticsReportPage } from '../../pages/statistics/report.page';
import { StatisticsDashboardPage } from '../../pages/statistics/dashboard.page';

test.describe('SW72: 统计报表', () => {
  let reportPage: StatisticsReportPage;
  let dashboardPage: StatisticsDashboardPage;

  // Mock Data
  const mockDeptStats = [
    {
      deptId: 1,
      deptName: '研发部',
      totalHeadcount: 10,
      normalCount: 150,
      lateCount: 5,
      earlyLeaveCount: 2,
      absentCount: 1,
      leaveCount: 3,
      attendanceRate: 95.5
    },
    {
      deptId: 2,
      deptName: '市场部',
      totalHeadcount: 8,
      normalCount: 120,
      lateCount: 10,
      earlyLeaveCount: 0,
      absentCount: 0,
      leaveCount: 5,
      attendanceRate: 92.0
    }
  ];

  const mockChartStats = {
    dailyTrend: [
      { date: '2024-02-01', attendanceRate: 98 },
      { date: '2024-02-02', attendanceRate: 95 },
      { date: '2024-02-03', attendanceRate: 97 }
    ],
    statusDistribution: [
      { status: 'normal', count: 270 },
      { status: 'late', count: 15 },
      { status: 'early', count: 2 },
      { status: 'absent', count: 1 },
      { status: 'leave', count: 8 }
    ]
  };

  test.beforeEach(async ({ authenticatedPage }) => {
    reportPage = new StatisticsReportPage(authenticatedPage);
    dashboardPage = new StatisticsDashboardPage(authenticatedPage);

    // Mock APIs with correct response structure
    await authenticatedPage.route('**/api/v1/statistics/departments*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockDeptStats
        })
      });
    });

    await authenticatedPage.route('**/api/v1/statistics/charts*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockChartStats
        })
      });
    });

    await authenticatedPage.route('**/api/v1/statistics/export*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: Buffer.from('fake-excel-content')
      });
    });
  });

  test('看板导航', async () => {
    await dashboardPage.goto();
    await expect(dashboardPage.page.getByText('每日统计表')).toBeVisible();
    await expect(dashboardPage.page.getByText('月度汇总表')).toBeVisible();
    await expect(dashboardPage.page.getByText('月度卡表')).toBeVisible();
  });

  test('报表默认展示', async () => {
    await reportPage.goto();
    await reportPage.waitForLoad();
    await reportPage.verifyChartsVisible();
    await reportPage.verifyTableData(['研发部', '市场部']);
  });

  test('按月份搜索', async () => {
    await reportPage.goto();
    
    const searchMonth = '2024-01';
    let requestMade = false;
    
    await reportPage.page.route(`**/api/v1/statistics/departments?month=${searchMonth}*`, async route => {
        requestMade = true;
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [mockDeptStats[0]]
            })
        });
    });

    await reportPage.search(searchMonth);
    
    await expect(async () => {
        expect(requestMade).toBeTruthy();
    }).toPass();

    await reportPage.verifyTableData(['研发部']);
    await expect(reportPage.deptStatsTable).not.toContainText('市场部');
  });

  test('导出功能', async () => {
    await reportPage.goto();
    const downloadPromise = reportPage.page.waitForEvent('download');
    await reportPage.export();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('attendance_stats');
  });

  test('空数据展示', async () => {
     await reportPage.page.route('**/api/v1/statistics/departments*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
        })
      });
    });

    await reportPage.goto();
    await reportPage.verifyEmptyTable();
  });
});
