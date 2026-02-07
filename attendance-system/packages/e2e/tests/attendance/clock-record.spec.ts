import { test, expect } from '../../fixtures';
import { ClockRecordPage } from '../../pages/clock-record.page';
import dayjs from 'dayjs';

test.describe('打卡记录 (Clock Record)', () => {
  let clockRecordPage: ClockRecordPage;
  let employeeName: string;

  test.beforeEach(async ({ authenticatedPage, testData }) => {
    clockRecordPage = new ClockRecordPage(authenticatedPage);

    // Create a department first (required for employee)
    const department = await testData.createDepartment({
      name: `Dept-${Date.now()}`
    });

    // Create a test employee
    const employee = await testData.createEmployee({
      name: `Emp-${Date.now()}`,
      phone: testData.generatePhone(),
      deptId: department.id
    });
    employeeName = employee.name;

    await clockRecordPage.goto();
  });

  test('手动补录打卡', async () => {
    const clockTime = dayjs().format('YYYY-MM-DDTHH:mm');
    
    // Manual clock-in
    await clockRecordPage.manualClock(employeeName, clockTime, '上班');
    
    // Verify record in list
    // Note: The time format in list might differ (e.g. HH:mm:ss)
    // We check if the record exists for this employee
    await clockRecordPage.expectRecord(employeeName, dayjs(clockTime).format('HH:mm'), '手动');
  });

  test('筛选打卡记录', async () => {
    // Prepare data: create a record for today
    const todayStr = dayjs().format('YYYY-MM-DDTHH:mm');
    await clockRecordPage.manualClock(employeeName, todayStr, '上班');
    
    // Search by date (today)
    const todayDate = dayjs().format('YYYY-MM-DD');
    // Start of day
    const start = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm');
    const end = dayjs().endOf('day').format('YYYY-MM-DDTHH:mm');
    
    await clockRecordPage.searchByDate(start, end);
    
    // Expect record to be visible
    await clockRecordPage.expectRecord(employeeName, dayjs(todayStr).format('HH:mm'), '手动');
    
    // Search by date (future - empty)
    const futureStart = dayjs().add(10, 'day').format('YYYY-MM-DDTHH:mm');
    const futureEnd = dayjs().add(11, 'day').format('YYYY-MM-DDTHH:mm');
    
    await clockRecordPage.searchByDate(futureStart, futureEnd);
    
    // Expect no record for this employee
    await expect(clockRecordPage.table.rows.filter({ hasText: employeeName })).not.toBeVisible();
  });
});
