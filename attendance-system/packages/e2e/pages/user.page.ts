import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * 用户管理页面对象
 */
export class UserPage extends BasePage {
  readonly url = '/users';

  // 列表页元素
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // 模态框元素
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly roleSelect: Locator;
  readonly statusSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // 列表页
    this.addButton = page.getByRole('button', { name: '添加' });
    this.searchInput = page.getByPlaceholder('请输入用户名', { exact: true }); // 精确匹配以免混淆
    this.searchButton = page.getByRole('button', { name: '查询' });

    // 模态框 (UserModal)
    // 使用 getModal() 限制范围，避免与列表页的搜索框冲突
    const modal = this.getModal();
    this.usernameInput = modal.getByPlaceholder('请输入用户名');
    // 注意：密码输入框在不同模式下 placeholder 不同，但在创建模式下是 "请输入密码"
    // 为了稳健，我们可以用 locator 结合结构，或者只在 create 测试中用 placeholder
    this.passwordInput = modal.locator('input[type="password"]'); 
    this.roleSelect = modal.locator('select').nth(0); // 假设它是第一个 select，或者用文本定位
    this.statusSelect = modal.locator('select').nth(1);
    this.submitButton = modal.getByRole('button', { name: '确定' });
    this.cancelButton = modal.getByRole('button', { name: '取消' });
  }

  /**
   * 打开添加用户模态框
   */
  async openCreateModal(): Promise<void> {
    await this.addButton.click();
    await expect(this.getModal()).toBeVisible();
  }

  /**
   * 填写用户表单
   */
  async fillUserForm(data: { username?: string; password?: string; role?: string; status?: string }): Promise<void> {
    if (data.username !== undefined) {
      await this.usernameInput.fill(data.username);
    }
    if (data.password !== undefined) {
      await this.passwordInput.fill(data.password);
    }
    // Selects handle value or label, here we assume value for simplicity based on implementation
    // Implementation uses <option value="user">, etc.
    if (data.role !== undefined) {
      // Find select that contains this option or use specific locator if needed
      // Simplify: assumes role is the first select in the modal form
      // Actually, looking at UserModal.tsx, role is the first select, status is second.
      // Let's improve locators in constructor if needed, but nth(0) is risky if order changes.
      // Better: locate by label text.
      // The label is "角色:", followed by div > select.
      // Playwright's getByLabel doesn't work well with non-standard labels unless 'for' attribute is used.
      // Let's stick to simple locators for now or use layout based.
      await this.roleSelect.selectOption(data.role);
    }
    if (data.status !== undefined) {
      await this.statusSelect.selectOption(data.status);
    }
  }

  /**
   * 提交表单
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * 获取特定字段的错误提示
   * @param field 'username' | 'password'
   */
  async getFieldError(field: 'username' | 'password'): Promise<string | null> {
    // In UserModal.tsx: {errors.username && <p ...>{errors.username}</p>}
    // The error is a sibling of the input container or inside it.
    // It has text-red-500 class.
    
    // We can scope to the form group.
    // Username group: label "用户名" -> input -> p
    // Let's find the p tag with text-red-500 near the input.
    if (field === 'username') {
        return await this.usernameInput.locator('xpath=../following-sibling::p').textContent() || 
               await this.usernameInput.locator('xpath=..//p').textContent();
    } else {
        return await this.passwordInput.locator('xpath=..//p').textContent();
    }
  }
  
  /**
   * 检查页面上是否存在包含指定文本的错误提示
   */
  async expectValidationError(text: string): Promise<void> {
    await expect(this.getModal().locator(`text=${text}`)).toBeVisible();
  }
}
