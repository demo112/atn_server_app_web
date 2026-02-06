import { test, expect } from '../../fixtures';
import { DailyRecordsPage } from '../../pages/daily-records.page';
import dayjs from 'dayjs';

test.describe('考勤明细 (SW71)', () => {
  let dailyRecordsPage: DailyRecordsPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    dailyRecordsPage = new DailyRecordsPage(authenticatedPage);
    await dailyRecordsPage.goto();
    await dailyRecordsPage.waitForLoad();
  });

  test('页面加载正常', async () => {
    await expect(dailyRecordsPage.page.getByRole('heading', { name: '考勤明细' })).toBeVisible();
    await expect(dailyRecordsPage.table).toBeVisible();
  });

  test('管理员可以使用筛选查询', async ({ testData }) => {
    // 1. 准备数据
    const dept = await testData.createDepartment({ name: '测试部' });
    const emp = await testData.createEmployee({ name: '考勤测试', deptId: dept.id });
    
    // 2. 填写筛选条件
    const today = dayjs().format('YYYY-MM-DD');
    await dailyRecordsPage.search(emp.name, today, today);
    
    // 3. 验证结果
    // 即使没有数据，也不应该报错，表格应该显示（可能显示空状态）
    // 这里主要验证筛选交互没有 Crash
    await expect(dailyRecordsPage.table).toBeVisible();
  });

  test('手动重算功能', async ({ testData }) => {
    // 1. 准备数据
    const dept = await testData.createDepartment({ name: '重算部' });
    const emp = await testData.createEmployee({ name: '重算测试', deptId: dept.id });
    const today = dayjs().format('YYYY-MM-DD');
    
    // 2. 执行重算
    await dailyRecordsPage.triggerRecalculate(today, today);
    
    // 3. 验证
    // 验证成功 Toast
    await expect(dailyRecordsPage.page.getByText('重新计算完成')).toBeVisible();
  });
});
