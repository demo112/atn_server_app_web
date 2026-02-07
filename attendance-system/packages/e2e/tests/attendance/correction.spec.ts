import { test, expect } from '../../fixtures';
import { CorrectionPage } from '../../pages/correction.page';
import dayjs from 'dayjs';

test.describe('补签申请 (Correction)', () => {
  let correctionPage: CorrectionPage;
  let employeeName: string;
  let employeeId: number;
  let correctionId: number;

  test.beforeEach(async ({ authenticatedPage, testData, api, correctionPage: page }) => {
    correctionPage = page;

    // 1. Create Department
    const dept = await testData.createDepartment({ name: `Dept-${Date.now()}` });
    
    // 2. Create Employee
    const emp = await testData.createEmployee({ 
        name: `Emp-${Date.now()}`,
        phone: testData.generatePhone(),
        deptId: dept.id
    });
    employeeName = emp.name;
    employeeId = emp.id;

    // 2.1 Create Schedule (Required for Daily Record generation)
          // Ensure shift covers all days (including weekends) to guarantee daily record generation
          const period = await testData.createTimePeriod();
          const days = Array.from({ length: 7 }, (_, i) => ({
            dayOfCycle: i + 1,
            periodIds: [period.id]
          }));
          const shift = await testData.createShift({ days });
          
          await testData.createSchedule({
              employeeId: emp.id,
              shiftId: shift.id,
              startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
              endDate: dayjs().endOf('month').format('YYYY-MM-DD')
          });

    // 3. Create Correction via API
    const today = dayjs().format('YYYY-MM-DD');
    // We use testData.createCorrection which handles daily record creation
    await testData.createCorrection({
        employeeId: emp.id,
        date: today,
        time: '09:00:00',
        remark: 'Forgot'
    });

    // 4. Get correction ID
    const corrections = await api.getCorrections({
        employeeId: emp.id,
        startDate: today,
        endDate: today
    });
    const items = Array.isArray(corrections) ? corrections : corrections.items;
    correctionId = items[0].id;

    await correctionPage.goto();
  });

  test('查看和筛选补签记录', async () => {
    // Verify record exists
    await correctionPage.expectRecord(employeeName, '补签到', '09:00');

    // Filter by date (today)
    const today = dayjs().format('YYYY-MM-DD');
    await correctionPage.filterByDate(today, today);
    await correctionPage.expectRecord(employeeName, '补签到', '09:00');

    // Filter by date (future)
    const future = dayjs().add(1, 'month').format('YYYY-MM-DD');
    await correctionPage.filterByDate(future, future);
    await expect(correctionPage.table.rows.filter({ hasText: employeeName })).not.toBeVisible();
  });

  test('编辑补签记录', async () => {
    // Edit time
    const newTime = dayjs().format('YYYY-MM-DD 09:30');
    
    await correctionPage.edit(correctionId, newTime);
    
    // Verify update
    await correctionPage.expectRecord(employeeName, '补签到', '09:30');
  });

  test('删除补签记录', async () => {
    await correctionPage.delete(correctionId);
    
    // Verify deletion
    await expect(correctionPage.table.rows.filter({ hasText: correctionId.toString() })).not.toBeVisible();
  });
});
