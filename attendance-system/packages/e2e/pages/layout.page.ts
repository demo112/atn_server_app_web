import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LayoutPage extends BasePage {
  readonly url = '/';

  readonly sidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.locator('aside');
  }

  /**
   * Get a top-level menu item (parent)
   */
  getParentMenu(label: string) {
    // Parent menus are divs with text, not links (based on Sidebar.tsx)
    // They are inside li -> div
    return this.sidebar.locator('div').filter({ hasText: label }).first();
  }

  /**
   * Get a sub-menu item (link)
   */
  getSubMenu(label: string) {
    return this.sidebar.getByRole('link', { name: label });
  }

  /**
   * Toggle a parent menu
   */
  async toggleMenu(label: string) {
    const menu = this.getParentMenu(label);
    await expect(menu).toBeVisible();
    await menu.click();
  }

  /**
   * Click a sub-menu link
   */
  async clickSubMenu(label: string) {
    const menu = this.getSubMenu(label);
    await expect(menu).toBeVisible();
    await menu.click();
  }
}
