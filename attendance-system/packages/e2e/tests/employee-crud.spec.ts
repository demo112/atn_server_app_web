import { test, expect } from '../fixtures';

test.describe('人员管理 (Employee)', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(60000); // 增加超时时间
  let deptName: string;
  let deptId: number;

  test.beforeEach(async ({ employeePage, testData }) => {
    // 准备数据：创建一个部门
    const dept = await testData.createDepartment({ name: 'E2E测试部门' });
    deptName = dept.name;
    deptId = dept.id;
    
    await employeePage.goto();
    await employeePage.waitForLoad();
  });

  test('应该能成功创建员工', async ({ employeePage, testData }) => {
    const employeeNo = testData.generateEmployeeNo();
    const name = `E2E员工_${Date.now()}`;
    const phone = testData.generatePhone();
    
    await employeePage.openCreateModal();
    
    await employeePage.fillEmployeeForm({
      employeeNo,
      name,
      phone,
      email: `e2e_${Date.now()}@example.com`,
      hireDate: '2024-01-01',
      department: deptName
    });
    
    await employeePage.submit();
    await employeePage.expectCreateSuccess();
    
    // 验证列表中存在
    await expect(employeePage.tableBody).toContainText(name);
  });

  test('应该能验证必填项', async ({ employeePage }) => {
    await employeePage.openCreateModal();
    
    // 直接提交
    await employeePage.submit();
    
    // 验证错误提示 (Toast)
    await expect(employeePage.page.getByText('请输入工号')).toBeVisible();
    
    // 填了工号再提交
    await employeePage.employeeNoInput.fill('E999');
    await employeePage.submit();
    await expect(employeePage.page.getByText('请输入姓名')).toBeVisible();
  });

  test('应该能删除员工', async ({ employeePage, testData }) => {
    // Arrange: 通过 API 创建一个员工
    const employee = await testData.createEmployee({ 
      name: '待删除员工', 
      deptId: deptId 
    });
    
    // 刷新页面以显示新员工
    await employeePage.page.reload();
    await employeePage.waitForLoad();
    
    // Act
    await employeePage.deleteEmployee(employee.name);
    
    // Assert
    await expect(employeePage.page.getByText('删除成功')).toBeVisible();
    await expect(employeePage.tableBody).not.toContainText(employee.name);
  });
});
