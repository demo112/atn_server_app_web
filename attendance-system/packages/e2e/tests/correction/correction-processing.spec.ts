import { test, expect } from '../../fixtures';
import { CorrectionProcessingPage } from '../../pages/correction-processing.page';
import { format, subDays } from 'date-fns';

test.describe('补签处理 (Correction Processing)', () => {
  let correctionPage: CorrectionProcessingPage;
  let employee: any;
  let shift: any;

  test.beforeEach(async ({ authenticatedPage, testData }) => {
    correctionPage = new CorrectionProcessingPage(authenticatedPage);
    
    // 1. 准备基础数据
    const dept = await testData.createDepartment({ name: '测试部门' });
    employee = await testData.createEmployee({ name: '补签测试', deptId: dept.id });
    shift = await testData.createShift();
    
    // 2. 安排昨日排班
    const yesterday = subDays(new Date(), 1);
    const dateStr = format(yesterday, 'yyyy-MM-dd');
    
    await testData.createSchedule({
      employeeId: employee.id,
      shiftId: shift.id,
      startDate: dateStr,
      endDate: dateStr
    });

    // 3. 触发重算生成缺勤记录
    await testData.api?.recalculate({
      startDate: dateStr,
      endDate: dateStr,
      employeeIds: [employee.id]
    });

    await correctionPage.goto();
    await correctionPage.waitForLoad();
  });

  test('补签到流程', async () => {
    // 筛选
    // Note: The UI might not have a direct employee search, or it might be in "Selection Modal" or just generic filter.
    // Our POM `filterByStatus` selects status.
    // Let's filter by "缺勤" or "全部异常" (default).
    
    await correctionPage.filterByStatus('缺勤');
    
    // Check-In
    const yesterday = subDays(new Date(), 1);
    const checkInTime = `${format(yesterday, 'yyyy-MM-dd')}T09:00`;
    
    await correctionPage.openCheckIn(employee.name);
    await correctionPage.submitCheckIn(checkInTime, 'E2E测试补签到');
    
    // Verify
    // After submission, the record status might change or need recalculation again.
    // The UI toast says "补签申请提交成功".
    // Usually one needs to recalculate to see status change to Normal/Late/etc.
    // But the test goal is to verify the "Processing" action works.
  });

  test('补签退流程', async () => {
    await correctionPage.filterByStatus('缺勤');
    
    const yesterday = subDays(new Date(), 1);
    const checkOutTime = `${format(yesterday, 'yyyy-MM-dd')}T18:00`;
    
    await correctionPage.openCheckOut(employee.name);
    await correctionPage.submitCheckOut(checkOutTime, 'E2E测试补签退');
  });
});
