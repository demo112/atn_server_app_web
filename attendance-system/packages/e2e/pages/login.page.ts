import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * 登录页面对象
 * 封装登录页面的定位器和操作方法
 */
export class LoginPage extends BasePage {
  readonly url = '/login';

  // 定位器（语义化优先）
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly agreeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    // 使用 placeholder 定位输入框
    this.usernameInput = page.getByPlaceholder('手机号/邮箱');
    this.passwordInput = page.getByPlaceholder('请输入密码');
    // 使用 id 定位复选框
    this.agreeCheckbox = page.locator('#terms');
    // 使用 role + name 定位按钮
    this.loginButton = page.getByRole('button', { name: /登录/ });
    // 链接
    this.forgotPasswordLink = page.getByRole('link', { name: '忘记密码' });
    this.registerLink = page.getByRole('link', { name: '立即注册' });
  }

  /**
   * 执行登录操作
   * @param username 用户名
   * @param password 密码
   * @param agreeTerms 是否勾选协议（默认 true）
   */
  async login(username: string, password: string, agreeTerms = true): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (agreeTerms) {
      await this.agreeCheckbox.check();
    }
    await this.loginButton.click();
  }

  /**
   * 仅填写表单，不点击登录
   */
  async fillForm(username: string, password: string, agreeTerms = false): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    if (agreeTerms) {
      await this.agreeCheckbox.check();
    }
  }

  /**
   * 断言：登录成功跳转首页
   */
  async expectLoginSuccess(): Promise<void> {
    // 等待跳转到首页
    await expect(this.page).toHaveURL('/');
  }

  /**
   * 断言：显示错误提示
   * @param message 期望的错误消息（部分匹配）
   */
  async expectError(message: string): Promise<void> {
    const toast = this.getToast();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
  }

  /**
   * 断言：显示警告提示
   * @param message 期望的警告消息（部分匹配）
   */
  async expectWarning(message: string): Promise<void> {
    const toast = this.getToast();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(message);
  }

  /**
   * 断言：登录按钮处于加载状态
   */
  async expectLoading(): Promise<void> {
    await expect(this.loginButton).toContainText('登录中');
    await expect(this.loginButton).toBeDisabled();
  }

  /**
   * 断言：登录按钮可用
   */
  async expectReady(): Promise<void> {
    await expect(this.loginButton).toContainText('登录');
    await expect(this.loginButton).toBeEnabled();
  }

  /**
   * 断言：协议复选框已勾选
   */
  async expectAgreed(): Promise<void> {
    await expect(this.agreeCheckbox).toBeChecked();
  }

  /**
   * 断言：协议复选框未勾选
   */
  async expectNotAgreed(): Promise<void> {
    await expect(this.agreeCheckbox).not.toBeChecked();
  }
}
