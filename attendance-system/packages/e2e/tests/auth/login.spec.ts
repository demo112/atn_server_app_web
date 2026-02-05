import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/login.page';

/**
 * 登录功能 E2E 测试
 * 
 * 测试场景：
 * 1. 正确账号密码登录成功
 * 2. 错误密码显示错误提示
 * 3. 未勾选协议显示警告
 * 4. 空用户名/密码显示警告
 */
test.describe('登录功能', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.waitForLoad();
  });

  /**
   * 测试：正确账号密码登录成功
   * Requirements: 7.2
   */
  test('正确账号密码登录成功', async ({ page }) => {
    // 执行登录
    await loginPage.login('admin', '123456');

    // 验证跳转到首页
    await loginPage.expectLoginSuccess();

    // 验证 localStorage 中有 token
    const token = await page.evaluate(() => localStorage.getItem('atn_token'));
    expect(token).not.toBeNull();
    expect(token!.length).toBeGreaterThan(0);
  });

  /**
   * 测试：错误密码显示错误提示
   * Requirements: 7.3
   */
  test('错误密码显示错误提示', async () => {
    // 使用错误密码登录
    await loginPage.login('admin', 'wrongpassword');

    // 验证显示错误提示
    await loginPage.expectError('Invalid credentials');

    // 验证仍在登录页
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  /**
   * 测试：未勾选协议显示警告
   * Requirements: 7.4
   */
  test('未勾选协议显示警告', async () => {
    // 填写表单但不勾选协议
    await loginPage.fillForm('admin', '123456', false);
    await loginPage.loginButton.click();

    // 验证显示警告提示
    await loginPage.expectWarning('请先阅读并同意服务协议和隐私协议');

    // 验证仍在登录页
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  /**
   * 测试：空用户名显示警告
   */
  test('空用户名显示警告', async () => {
    // 只填写密码
    await loginPage.passwordInput.fill('admin123');
    await loginPage.agreeCheckbox.check();
    await loginPage.loginButton.click();

    // 验证显示警告提示
    await loginPage.expectWarning('请输入用户名和密码');
  });

  /**
   * 测试：空密码显示警告
   */
  test('空密码显示警告', async () => {
    // 只填写用户名
    await loginPage.usernameInput.fill('admin');
    await loginPage.agreeCheckbox.check();
    await loginPage.loginButton.click();

    // 验证显示警告提示
    await loginPage.expectWarning('请输入用户名和密码');
  });

  /**
   * 测试：页面元素正确渲染
   */
  test('页面元素正确渲染', async () => {
    // 验证输入框存在
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // 验证复选框存在且未勾选
    await expect(loginPage.agreeCheckbox).toBeVisible();
    await loginPage.expectNotAgreed();

    // 验证登录按钮存在且可用
    await expect(loginPage.loginButton).toBeVisible();
    await loginPage.expectReady();

    // 验证链接存在
    await expect(loginPage.forgotPasswordLink).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  /**
   * 测试：勾选协议后状态正确
   */
  test('勾选协议后状态正确', async () => {
    // 初始未勾选
    await loginPage.expectNotAgreed();

    // 勾选
    await loginPage.agreeCheckbox.check();
    await loginPage.expectAgreed();

    // 取消勾选
    await loginPage.agreeCheckbox.uncheck();
    await loginPage.expectNotAgreed();
  });
});
