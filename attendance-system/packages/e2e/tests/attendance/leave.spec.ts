import { test, expect } from '../../fixtures';
import { LeavePage } from '../../pages/leave.page';

// Custom date formatting helper to avoid date-fns dependency issues
function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const HH = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}`;
}

test.describe('请假管理 (SW67)', () => {
  let leavePage: LeavePage;
  let testDept: any;
  let testEmployee: any;

  test.beforeEach(async ({ authenticatedPage, testData, api }) => {
    // Ensure API client is set for testData factory
    testData.setApi(api);

    leavePage = new LeavePage(authenticatedPage);
    
    // Prepare data
    testDept = await testData.createDepartment({ name: '测试部' });
    testEmployee = await testData.createEmployee({ 
      name: '请假王', 
      deptId: testDept.id 
    });

    await leavePage.goto();
    await leavePage.waitForLoad();
  });

  test('P0: 创建请假记录', async () => {
    // Arrange
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set fixed hours for stability
    now.setHours(9, 0, 0, 0);
    tomorrow.setHours(18, 0, 0, 0);
    
    const startTime = formatDate(now);
    const endTime = formatDate(tomorrow);

    // Act
    await leavePage.openCreateDialog();
    await leavePage.selectEmployee(testDept.name, testEmployee.name);
    
    // Note: Assuming '事假' is a valid type in the dropdown
    await leavePage.fillLeaveForm({ 
      type: '事假', 
      startTime, 
      endTime, 
      reason: 'E2E测试请假' 
    });
    
    await leavePage.submit();

    // Assert
    await leavePage.expectToast('创建成功');
    await leavePage.expectRecord(testEmployee.name, '已通过');
  });

  test('P0: 撤销请假记录', async () => {
    // Arrange: Create a record first
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2); // Different dates
    
    const startTime = formatDate(now);
    const endTime = formatDate(tomorrow);

    await leavePage.openCreateDialog();
    await leavePage.selectEmployee(testDept.name, testEmployee.name);
    await leavePage.fillLeaveForm({ 
      type: '事假', 
      startTime, 
      endTime, 
      reason: 'E2E测试撤销' 
    });
    await leavePage.submit();
    await leavePage.expectToast('创建成功');

    // Act: Cancel it
    await leavePage.cancelLeave(testEmployee.name);

    // Assert
    await leavePage.expectToast('撤销成功');
    await leavePage.expectRecord(testEmployee.name, '已撤销');
  });
});
