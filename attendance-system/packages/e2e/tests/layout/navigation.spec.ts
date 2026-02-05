import { test, expect } from '../../fixtures';

test.describe('Layout - Navigation', () => {

  test.beforeEach(async ({ layoutPage }) => {
    await layoutPage.goto();
  });

  test('should expand parent menu without navigation', async ({ layoutPage, page }) => {
    const initialUrl = page.url();
    
    // 点击 "考勤处理"
    await layoutPage.toggleMenu('考勤处理');
    
    // 验证 URL 未发生跳转
    expect(page.url()).toBe(initialUrl);
    
    // 验证子菜单可见
    await expect(layoutPage.getSubMenu('补签记录')).toBeVisible();
    await expect(layoutPage.getSubMenu('补签处理')).toBeVisible();
  });

  test('should have correct correction menu items', async ({ layoutPage }) => {
    // 确保展开
    await layoutPage.toggleMenu('考勤处理');
    
    // 验证 "补签记录"
    const correctionRecord = layoutPage.getSubMenu('补签记录');
    await expect(correctionRecord).toBeVisible();
    await expect(correctionRecord).toHaveAttribute('href', '/attendance/correction');
    
    // 验证 "补签处理"
    const correctionProcess = layoutPage.getSubMenu('补签处理');
    await expect(correctionProcess).toBeVisible();
    await expect(correctionProcess).toHaveAttribute('href', '/attendance/correction-processing');
  });

  test('should not crash when toggling menus', async ({ layoutPage }) => {
    // Regression test for blank screen fix
    await layoutPage.toggleMenu('考勤统计');
    
    // 验证侧边栏依然存在 (未白屏)
    await expect(layoutPage.sidebar).toBeVisible();
    
    // 验证子菜单可见
    await expect(layoutPage.getSubMenu('统计报表')).toBeVisible();
  });

});
