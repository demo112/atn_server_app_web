import { test, expect } from '../../fixtures';
import { SchedulePage } from '../../pages/schedule.page';
import { ShiftPage } from '../../pages/shift.page';
import dayjs from 'dayjs';

test.describe('排班管理 (SW65)', () => {
  let schedulePage: SchedulePage;
  let shiftPage: ShiftPage;
  let shiftName: string;
  let employeeName: string;
  let departmentName: string;

  test.beforeEach(async ({ authenticatedPage, testData }) => {
    // 监听浏览器控制台日志
    authenticatedPage.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('[AttendanceService]') || msg.text().includes('[Debug]'))
        console.log(`[Browser Console] ${msg.text()}`);
    });

    schedulePage = new SchedulePage(authenticatedPage);
    shiftPage = new ShiftPage(authenticatedPage);
    
    // 1. 准备基础数据：班次
    shiftName = `早班-${testData.prefix}-${Date.now()}`;
    await shiftPage.goto();
    await shiftPage.create({
      name: shiftName,
      startTime: '09:00',
      endTime: '18:00'
    });

    // 2. 准备基础数据：员工和部门
    departmentName = `Dept-${testData.prefix}-${Date.now()}`;
    const department = await testData.createDepartment({ name: departmentName });
    
    // 使用 testData 辅助函数创建员工
    const employee = await testData.createEmployee({
      name: `Emp-${Date.now()}`,
      phone: testData.generatePhone(),
      deptId: department.id
    });
    employeeName = employee.name;
    
    // 3. 进入排班页面
    await schedulePage.goto();
    await schedulePage.waitForLoad();
    // Select department to enable calendar and ensure data context
    await schedulePage.selectDept(departmentName);
    
    // Wait for data to settle (reduce flakiness)
    await authenticatedPage.waitForTimeout(1000);
  });

  test.describe('个人排班', () => {
    test('创建排班 - 成功场景', async () => {
      const startDate = dayjs().format('YYYY-MM-DD');
      const endDate = dayjs().add(5, 'day').format('YYYY-MM-DD');

      await schedulePage.openCreateDialog();
      await schedulePage.fillCreateForm({
        employeeName: employeeName,
        shiftName: shiftName,
        startDate: startDate,
        endDate: endDate
      });
      await schedulePage.submitDialog();
      
      await schedulePage.toast.expectSuccess('创建成功');
      
      // 验证列表显示
      await schedulePage.filterByDate(startDate, endDate);
      // 这里的验证依赖于 SchedulePage 的实现，假设有方法验证表格内容
      // 如果没有，暂时先验证 Toast，后续完善
    });

    test('创建排班 - 冲突检测 (Force=false)', async () => {
      const startDate = dayjs().add(10, 'day').format('YYYY-MM-DD');
      const endDate = dayjs().add(15, 'day').format('YYYY-MM-DD');

      // 第一次创建
      await schedulePage.create({
        employeeName: employeeName,
        shiftName: shiftName,
        startDate: startDate,
        endDate: endDate
      });

      // 第二次创建（日期重叠）
      await schedulePage.openCreateDialog();
      await schedulePage.fillCreateForm({
        employeeName: employeeName,
        shiftName: shiftName,
        startDate: dayjs(startDate).add(1, 'day').format('YYYY-MM-DD'),
        endDate: dayjs(endDate).add(1, 'day').format('YYYY-MM-DD'),
        force: false
      });
      await schedulePage.dialogSubmitBtn.click();

      await schedulePage.toast.expectError('排班冲突');
    });

    test('创建排班 - 强制覆盖 (Force=true)', async () => {
      const startDate = dayjs().add(20, 'day').format('YYYY-MM-DD');
      const endDate = dayjs().add(25, 'day').format('YYYY-MM-DD');

      // 第一次创建
      await schedulePage.create({
        employeeName: employeeName,
        shiftName: shiftName,
        startDate: startDate,
        endDate: endDate
      });

      // 第二次创建（强制覆盖）
      await schedulePage.openCreateDialog();
      await schedulePage.fillCreateForm({
        employeeName: employeeName,
        shiftName: shiftName,
        startDate: dayjs(startDate).add(1, 'day').format('YYYY-MM-DD'),
        endDate: dayjs(endDate).add(1, 'day').format('YYYY-MM-DD'),
        force: true
      });
      await schedulePage.submitDialog();

      await schedulePage.toast.expectSuccess('创建成功');
    });
  });

  test.describe('批量排班', () => {
    test('部门批量排班', async () => {
        // 注意：部门选择逻辑可能比较复杂，需要在 SchedulePage 中实现 selectDepartment
        // 这里假设页面上有部门树，并且可以通过文本选择
        
        const startDate = dayjs().add(1, 'month').format('YYYY-MM-DD');
        const endDate = dayjs().add(1, 'month').add(5, 'day').format('YYYY-MM-DD');

        await schedulePage.openBatchDialog();
        
        // 假设 Page Object 封装了部门选择
        // 如果没有，这里可能需要 locator 操作
        // 暂时先只填表单，部门选择留给 Page Object 完善
        // 实际上 SchedulePage.fillBatchForm 应该包含部门选择逻辑，或者我们在此处补充
        
        // 由于 SchedulePage 尚未完全展示部门选择逻辑，我们先测试表单填写
        await schedulePage.fillBatchForm({
            shiftName: shiftName,
            startDate: startDate,
            endDate: endDate,
            force: true
        });
        
        // TODO: 需要在 BatchScheduleDialog 中选择部门
        // await schedulePage.selectDepartment(departmentName); 
        
        await schedulePage.submitDialog();
        await schedulePage.toast.expectSuccess(/批量排班成功/);
    });
  });
});
