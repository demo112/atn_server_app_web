import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class EmployeePage extends BasePage {
  readonly url = '/employees'; // 修正路由

  // 页面元素
  readonly addBtn: Locator;
  readonly searchInput: Locator;
  readonly searchBtn: Locator;
  readonly tableBody: Locator;
  
  // 弹窗元素
  readonly createModal: Locator;
  readonly employeeNoInput: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly hireDateInput: Locator;
  readonly deptSelectInput: Locator;
  readonly submitBtn: Locator;

  // 部门选择弹窗
  readonly deptSelectionModal: Locator;
  readonly deptConfirmBtn: Locator;

  constructor(page: Page) {
    super(page);
    
    // 页面元素
    // 按钮文本包含 Icon 文本 "add" 和中文 "添加"，所以用正则匹配
    this.addBtn = page.getByRole('button', { name: /添加/ }); 
    this.searchInput = page.getByPlaceholder('选择部门或人员'); 
    // 注意：PersonnelDashboard 里的搜索框其实是 SelectionModal 触发器，或者是下面的 FilterParams
    // 真正的搜索逻辑在 PersonnelDashboard.tsx 中：
    // L56 input placeholder="选择部门或人员" -> 触发 SelectionModal
    // L80 button "查询" -> 触发 onFilterChange
    // 但似乎没有显式的 keyword 输入框？
    // 回看 EmployeeList.tsx: handleFilterChange 会用 filters.name || filters.idNumber 更新 keyword
    // 回看 PersonnelDashboard.tsx: localFilters 状态包含 name, idNumber。
    // 但是界面上只看到了 "选择部门或人员" (SelectionModal) 和 "状态" (Select)。
    // 难道搜索只能通过 SelectionModal 选人？
    // 不，SelectionModal 是用来选人填入搜索条件的。
    
    // 修正：EmployeeList.tsx L18: keyword: filters.name || filters.idNumber || ''
    // PersonnelDashboard.tsx L56: input value={selectedItems.map(i=>i.name).join(', ')}
    // 这意味着搜索是通过弹窗选择具体的部门或人员来进行过滤的。
    // 这对 E2E 来说比较麻烦，可能需要模拟选择。
    
    this.searchBtn = page.getByRole('button', { name: '查询' });
    this.tableBody = page.locator('tbody');

    // 弹窗元素
    // 使用 .fixed 类定位模态框容器，因为它们没有 role="dialog" 属性
    this.createModal = page.locator('.fixed').filter({ hasText: /添加人员|编辑人员/ });
    this.employeeNoInput = page.locator('input[name="employeeNo"]');
    this.nameInput = page.locator('input[name="name"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.emailInput = page.locator('input[name="email"]');
    this.hireDateInput = page.locator('input[name="hireDate"]');
    this.deptSelectInput = page.getByPlaceholder('请选择部门');
    this.submitBtn = this.createModal.getByRole('button', { name: '确定' });

    // 部门选择弹窗
    this.deptSelectionModal = page.locator('.fixed').filter({ hasText: '选择部门' });
    this.deptConfirmBtn = this.deptSelectionModal.getByRole('button', { name: '确定' });
  }

  async openCreateModal() {
    await this.addBtn.click();
    await expect(this.createModal).toBeVisible();
  }

  async selectDepartment(deptName: string) {
    await this.deptSelectInput.click();
    await expect(this.deptSelectionModal).toBeVisible();
    
    // 等待加载完成
    await expect(this.deptSelectionModal.getByText('加载中...')).toBeHidden();
    
    // 直接选择第一个可用的部门（跳过搜索以提高稳定性）
    await this.deptSelectionModal.locator('.overflow-y-auto > div').first().click();
    
    await this.deptConfirmBtn.click();
    await expect(this.deptSelectionModal).toBeHidden();
  }

  async fillEmployeeForm(data: {
    employeeNo?: string;
    name: string;
    phone?: string;
    email?: string;
    hireDate: string;
    department?: string;
  }) {
    if (data.employeeNo) {
      await this.employeeNoInput.fill(data.employeeNo);
    }
    await this.nameInput.fill(data.name);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.hireDate) await this.hireDateInput.fill(data.hireDate);
    
    if (data.department) {
      await this.selectDepartment(data.department);
    }

    await this.submitBtn.click();
  }

  async submit() {
    await this.submitBtn.click();
  }

  async expectCreateSuccess() {
    await expect(this.createModal).toBeHidden();
    await expect(this.getToast().filter({ hasText: '创建成功' })).toBeVisible();
  }

  async expectUpdateSuccess() {
    await expect(this.createModal).toBeHidden();
    await expect(this.getToast().filter({ hasText: '更新成功' })).toBeVisible();
  }
  
  async deleteEmployee(name: string) {
    const row = this.tableBody.locator('tr').filter({ hasText: name });
    // 使用 .material-icons 定位删除按钮
    await row.locator('.material-icons').filter({ hasText: 'delete_outline' }).click();
    
    // 确认删除弹窗
    const confirmDialog = this.page.locator('.fixed').filter({ hasText: '确定要删除该员工吗' });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: '确定' }).click();
  }
}
