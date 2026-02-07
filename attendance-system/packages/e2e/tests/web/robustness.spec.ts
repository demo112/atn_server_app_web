
import { test, expect } from '../../fixtures';

test.describe('Web Robustness & Security', () => {
  const LONG_STRING = 'A'.repeat(5000);

  test('Login Page - Input Robustness', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with extremely long username
    await page.getByPlaceholder(/手机号\/邮箱|username/i).fill(LONG_STRING);
    await page.getByPlaceholder(/请输入密码|password/i).fill('password123');
    
    // Check terms
    const terms = page.locator('#terms');
    if (await terms.count() > 0) {
      await terms.check();
    }
    
    // Click login
    await page.getByRole('button', { name: /登录|login/i }).click();

    // Expectation:
    // Should show validation error. If not, it's a gap.
    // Toast location: fixed top-4 right-4
    const errorLocator = page.locator('.fixed.top-4.right-4, .ant-message-error, .error-message, [role="alert"]');
    
    try {
      await expect(errorLocator).toBeVisible({ timeout: 3000 });
    } catch (e) {
       // If we are redirected to dashboard, it's definitely a failure
       if (page.url().includes('/dashboard')) {
         throw new Error('[GAP] Vulnerability Confirmed: Login succeeded with 5000 chars username!');
       }
       // If we stayed on page but no error shown
       throw new Error('[GAP] Vulnerability Confirmed: Login UI did not show error for 5000 chars username!');
    }
  });

  test('Create User - Input Robustness', async ({ authenticatedPage: page }) => {
    // Navigate to User Management
    await page.goto('/users');
    
    // Open Create Modal
    await page.getByRole('button', { name: /添加|create/i }).click();

    const modal = page.getByRole('dialog');

    // Fill long username
    // Note: strict mode might fail if multiple placeholders match, using specific modal scope
    const usernameInput = modal.getByPlaceholder(/请输入用户名|username/i);
    await usernameInput.fill(LONG_STRING);
    
    // Check if maxLength is working (browser truncation)
    const value = await usernameInput.inputValue();
    if (value.length <= 50) {
      // Robustness achieved via truncation
      return;
    }

    // Fill other required fields to isolate the length error
    // Assuming password or phone might be required. 
    // Just filling basic stuff to trigger submit.
    
    // Click Submit
    await modal.getByRole('button', { name: /确定|submit|save/i }).click();
    
    // Expect error
    const errorLocator = page.locator('.fixed.top-4.right-4, .ant-message-error, .ant-form-item-explain-error');
    try {
      await expect(errorLocator).toBeVisible({ timeout: 3000 });
    } catch (e) {
      throw new Error('[GAP] Vulnerability Confirmed: User creation accepted 5000 chars username without error!');
    }
  });
});
