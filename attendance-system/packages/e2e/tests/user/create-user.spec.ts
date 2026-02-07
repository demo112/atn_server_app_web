import { test, expect } from '../../fixtures';
import { UserPage } from '../../pages/user.page';

test.describe('User Management - Creation', () => {
  let userPage: UserPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    userPage = new UserPage(authenticatedPage);
    await userPage.goto();
  });

  test('should validate username length (min 3 chars)', async () => {
    await userPage.openCreateModal();
    
    // 输入过短的用户名
    await userPage.fillUserForm({ 
      username: '11', 
      password: 'validPassword123' 
    });
    
    await userPage.submit();
    
    // 验证错误提示
    await userPage.expectValidationError('用户名至少需要3个字符');
  });

  test('should validate password length (min 6 chars)', async () => {
    await userPage.openCreateModal();
    
    // 输入过短的密码
    await userPage.fillUserForm({ 
      username: 'validUser', 
      password: '123' 
    });
    
    await userPage.submit();
    
    // 验证错误提示
    await userPage.expectValidationError('密码至少需要6个字符');
  });

  test('should create user successfully with valid data', async () => {
    const timestamp = Date.now();
    const username = `test_u_${timestamp}`;
    
    await userPage.openCreateModal();
    
    await userPage.fillUserForm({ 
      username: username, 
      password: 'password123',
      role: 'user',
      status: 'active'
    });
    
    await userPage.submit();
    
    // 验证模态框消失（隐含验证成功）
    await expect(userPage.getModal()).toBeHidden();
    
    // 验证列表中出现新用户
    // 刷新页面或搜索确保数据更新
    await userPage.searchInput.fill(username);
    await userPage.searchButton.click();
    
    // 使用 first() 避免 strict mode violation (如果列表中有多个相同文本)
    // 或者更严谨地：检查特定列
    await expect(userPage.page.getByText(username).first()).toBeVisible();
  });
});
