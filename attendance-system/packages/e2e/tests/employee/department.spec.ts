import { test, expect } from '../../fixtures';
import { EmployeePage } from '../../pages/employee.page';

test.describe('部门管理 (Department Management)', () => {
  let employeePage: EmployeePage;
  let rootDept: any;

  test.beforeEach(async ({ authenticatedPage, testData }) => {
    employeePage = new EmployeePage(authenticatedPage);
    
    // Create a root department via API to ensure we have a parent to attach to
    // This avoids dependency on existing seed data
    rootDept = await testData.createDepartment({ name: 'E2E_Root_Dept' });

    await employeePage.goto();
    await employeePage.waitForLoad();
  });

  test('部门 CRUD 流程 (Create, Edit, Delete)', async ({ testData }) => {
    const deptName = `${testData.prefix}TestDept`;
    const renamedDeptName = `${testData.prefix}TestDept_Renamed`;

    // 1. Create Sub-Department
    await test.step('创建子部门', async () => {
      await employeePage.addDepartment(rootDept.name, deptName);
      await employeePage.expectDepartmentVisible(deptName);
    });

    // 2. Edit Department
    await test.step('编辑部门', async () => {
      await employeePage.editDepartment(deptName, renamedDeptName);
      await employeePage.expectDepartmentVisible(renamedDeptName);
      await employeePage.expectDepartmentNotVisible(deptName);
    });

    // 3. Delete Department
    await test.step('删除部门', async () => {
      await employeePage.deleteDepartment(renamedDeptName);
      await employeePage.expectDepartmentNotVisible(renamedDeptName);
    });
  });

  test('部门变更在其他功能中可见 (Propagation)', async ({ testData }) => {
    const deptName = `${testData.prefix}Prop_Dept`;

    // 1. Create Department via UI
    await test.step('创建部门', async () => {
      await employeePage.addDepartment(rootDept.name, deptName);
      await employeePage.expectDepartmentVisible(deptName);
    });

    // 2. Verify in Employee Modal
    await test.step('验证部门在人员弹窗中可见', async () => {
      await employeePage.openAddEmployeeModal();
      await employeePage.checkDepartmentInSelect(deptName);
      // Close modal is handled inside checkDepartmentInSelect or we can just finish here
    });

    // 3. Cleanup (Delete via UI to keep state clean)
    await test.step('清理部门', async () => {
      // Re-load to close modal if it's still open (or ensure modal is closed)
      // checkDepartmentInSelect closes the dropdown but the modal is still open.
      // We need to close the modal first.
      await employeePage.closeAddEmployeeModal();
      
      await employeePage.deleteDepartment(deptName);
    });
  });
});
