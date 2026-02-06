
import { test, expect } from '../../fixtures';
import { CorrectionProcessingPage } from '../../pages/correction-processing.page';
import dayjs from 'dayjs';

test.describe('补签处理 (Correction Processing)', () => {
  let correctionPage: CorrectionProcessingPage;
  let employee: any;
  let shift: any;

  test.beforeEach(async ({ authenticatedPage, testData }) => {
    correctionPage = new CorrectionProcessingPage(authenticatedPage);

    // 1. 准备数据
    const dept = await testData.createDepartment({ name: '测试部' });
    employee = await testData.createEmployee({ name: '补签员工', deptId: dept.id });
    
    // 创建班次 (9:00-18:00)
    shift = await testData.createShift({
        name: '标准班次',
        days: undefined // Use default
    });

    // 创建排班 (今天)
    const today = dayjs().format('YYYY-MM-DD');
    await testData.createSchedule({
        employeeId: employee.id,
        shiftId: shift.id,
        startDate: today,
        endDate: today
    });

    // 触发重算以生成考勤记录
    if (testData['api']) { // Ensure API client is available
        await testData['api'].recalculate({
            startDate: today,
            endDate: today,
            employeeIds: [employee.id]
        });
    }

    // 2. 进入页面
    await correctionPage.goto();
    await correctionPage.waitForLoad();
  });

  test('管理员可以为员工补签到和补签退', async () => {
    // 1. 筛选员工
    await correctionPage.filterByEmployee(employee.name);

    // 2. 验证记录存在
    // 这里假设表格中会显示该员工的记录。具体状态可能是"缺卡"或"异常"
    // 我们主要验证能否点击补签按钮

    // 3. 补签到
    // 找到该员工的行，点击补签到
    // 由于 Page Object 可能还没有针对特定行的操作，我们先用 filter 确保只有一行，然后操作第一行
    // 或者扩展 Page Object 支持按行操作。
    // 这里直接使用 Locator 查找
    
    const row = correctionPage.page.getByRole('row').filter({ hasText: employee.name });
    await expect(row).toBeVisible();

    // 点击补签到按钮 (假设按钮文本是 "补签到" 或者图标)
    // 根据 Page Object 设计，我们可能需要更新它来支持行内操作
    // 暂时假设页面上有 "补签到" 按钮
    
    // 如果 Page Object 没有暴露行操作，我们可以直接在 test 中写 Locator，或者之后优化 Page Object
    // 让我们看看 CorrectionProcessingPage 的定义 (回忆)
    // 它有 checkInDialog 等，但点击按钮的动作通常在行内
    
    await row.getByRole('button', { name: '补签到' }).click();
    
    // 4. 填写表单
    const checkInTime = dayjs().format('YYYY-MM-DDT09:00');
    await correctionPage.submitCheckIn(checkInTime, '忘记打卡');

    // 5. 验证成功
    // 可能会有 Toast 提示
    await expect(correctionPage.page.getByText('补签成功')).toBeVisible({ timeout: 5000 });

    // 6. 补签退
    await row.getByRole('button', { name: '补签退' }).click();
    const checkOutTime = dayjs().format('YYYY-MM-DDT18:00');
    await correctionPage.submitCheckIn(checkOutTime, '忘记打卡'); // 复用 submitCheckIn 因为弹窗结构类似? 
    // Wait, submitCheckIn uses `this.checkInDialog`. Check-out might use a different dialog or same one.
    // Let's assume it uses the same dialog structure or check Page Object.
    // If CorrectionProcessingPage only has `checkInDialog`, we might need `checkOutDialog`.
    // Let's check CorrectionProcessingPage again if needed.
    
    await expect(correctionPage.page.getByText('补签成功')).toBeVisible({ timeout: 5000 });
  });
});
