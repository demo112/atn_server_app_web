import { test, expect } from '../../fixtures';
import dayjs from 'dayjs';

test.describe('原始考勤记录', () => {
  test.beforeEach(async ({ clockRecordPage }) => {
    // Do nothing, let individual tests handle navigation if data prep is needed
  });

  test('P0: 补录打卡成功', async ({ testData, clockRecordPage }) => {
    // 1. 准备数据
    const employee = await testData.createEmployee({ name: 'ManualClock' });
    
    // 2. 进入页面 (确保数据已存在)
    await clockRecordPage.goto();
    
    const now = dayjs();
    const clockTime = now.format('YYYY-MM-DDTHH:mm');
    
    // 3. 执行补录
    await clockRecordPage.manualClock(employee.name, clockTime, '上班');
    
    // 4. 验证列表
    // 只匹配时间 HH:mm，因为秒数可能不一致
    await clockRecordPage.expectRecord(employee.name, now.format('HH:mm'), '网页补录');
  });

  test('P2: 必填校验', async ({ clockRecordPage }) => {
    await clockRecordPage.goto();
    await clockRecordPage.manualClockBtn.click();
    await clockRecordPage.modal.waitForOpen();
    await clockRecordPage.modal.confirm();
    // 应该显示错误提示
    await clockRecordPage.toast.expectError('请填写完整信息');
    await clockRecordPage.modal.close();
  });
});
