import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly url = '/login';

  // 定位器（语义化优先）
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly agreeCheckbox: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('手机号/邮箱');
    this.passwordInput = page.getByPlaceholder('请输入密码');
    this.agreeCheckbox = page.getByRole('checkbox');
    this.loginButton = page.getByRole('button', { name: '登录' });
  }

  /** 执行登录操作 */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    // 勾选协议（如果未勾选）
    if (!(await this.agreeCheckbox.isChecked())) {
      await this.agreeCheckbox.check();
    }
    await this.loginButton.click();
  }

  /** 断言：登录成功跳转首页 */
  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL('/');
  }

  /** 断言：显示错误提示 */
  async expectError(message: string): Promise<void> {
    await expect(this.getToast()).toContainText(message);
  }

  /** 断言：显示警告提示 */
  async expectWarning(message: string): Promise<void> {
    await expect(this.getToast()).toContainText(message);
  }
}
