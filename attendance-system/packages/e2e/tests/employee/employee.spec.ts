import { test, expect } from '../../fixtures';
import { EmployeePage } from '../../pages/employee.page';

test.describe('人员管理 (Employee Management)', () => {
  let employeePage: EmployeePage;
  let rootDept: any;

  test.beforeEach(async ({ authenticatedPage, testData }) => {
    employeePage = new EmployeePage(authenticatedPage);
    
    // Create a root department via API
    rootDept = await testData.createDepartment({ name: 'E2E_Emp_Dept' });
    
    await employeePage.goto();
    await employeePage.waitForLoad();
    
    // Select the department to ensure we see employees in it (sidebar auto-selects first one, which might not be ours)
    await employeePage.selectDepartment(rootDept.name);
  });

  test('人员 CRUD 流程 (Create, Edit, Delete)', async ({ testData }) => {
    const empData = {
      name: `${testData.prefix}TestEmp`,
      employeeNo: testData.generateEmployeeNo(),
      department: rootDept.name,
      phone: testData.generatePhone(),
      hireDate: '2023-01-01'
    };

    // 1. Create
    await test.step('创建人员', async () => {
      await employeePage.openAddEmployeeModal();
      await employeePage.fillEmployeeForm(empData);
      await employeePage.saveEmployee();
      await employeePage.expectEmployeeVisible(empData.name);
    });

    // 2. Edit
    const newName = `${testData.prefix}EditedEmp`;
    await test.step('编辑人员', async () => {
      await employeePage.editEmployee(empData.name, { name: newName });
      await employeePage.expectEmployeeVisible(newName);
      await employeePage.expectEmployeeNotVisible(empData.name);
    });

    // 3. Delete
    await test.step('删除人员', async () => {
      await employeePage.deleteEmployee(newName);
      await employeePage.expectEmployeeNotVisible(newName);
    });
  });

  test('人员搜索 (Search)', async ({ testData }) => {
    const empName = `${testData.prefix}SearchEmp`;
    const empNo = testData.generateEmployeeNo();
    
    // Create employee via UI for simplicity in this flow (or API if available)
    await test.step('准备数据', async () => {
      await employeePage.openAddEmployeeModal();
      await employeePage.fillEmployeeForm({
        name: empName,
        employeeNo: empNo,
        department: rootDept.name,
        hireDate: '2023-01-01'
      });
      await employeePage.saveEmployee();
      await employeePage.expectEmployeeVisible(empName);
    });

    await test.step('搜索人员', async () => {
      await employeePage.searchByEmployee(empName);
      await employeePage.expectEmployeeVisible(empName);
      
      // Optional: verify that other employees are NOT visible if we had any.
      // But we might be the only one if DB is clean or isolated.
    });

    await test.step('重置搜索', async () => {
      await employeePage.clearSearch();
      await employeePage.expectEmployeeVisible(empName);
    });
    
    // Cleanup
    await test.step('清理数据', async () => {
      await employeePage.deleteEmployee(empName);
    });
  });
  
  test('校验必填字段 (Validation)', async ({ testData }) => {
    await test.step('打开弹窗并直接提交', async () => {
      await employeePage.openAddEmployeeModal();
      await employeePage.submitEmployeeForm();
    });

    await test.step('验证错误提示', async () => {
      await employeePage.toast.expectError('请输入工号！');
    });
    
    await test.step('关闭弹窗', async () => {
      await employeePage.closeAddEmployeeModal();
    });
  });
});
