import { test, expect } from '../fixtures';

test('LoginPage has correct elements', async ({ loginPage }) => {
  await loginPage.goto();
  await expect(loginPage.usernameInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.agreeCheckbox).toBeVisible();
  await expect(loginPage.loginButton).toBeVisible();
});
