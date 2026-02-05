import { test, expect } from '../../fixtures';

test.describe('Attendance - Shift Management', () => {
  test.beforeEach(async ({ shiftPage }) => {
    await shiftPage.goto();
  });

  test('should display pagination', async ({ shiftPage }) => {
    // Wait for pagination to be visible
    await expect(shiftPage.pagination).toBeVisible();
    
    // Check key elements inside pagination
    await expect(shiftPage.pagination).toContainText('共');
    await expect(shiftPage.pagination).toContainText('条/页');
    
    // Check if page size select exists
    const select = shiftPage.pagination.locator('select');
    await expect(select).toBeVisible();
    
    // Check if current page is displayed (assuming page 1)
    // The button with class bg-primary should contain '1'
    const activePage = shiftPage.pagination.locator('button.bg-primary');
    await expect(activePage).toBeVisible();
    await expect(activePage).toHaveText('1');
  });
  
  test('should render icons correctly', async ({ shiftPage }) => {
     // Check if there is at least one icon (e.g. edit/delete actions in table, or chevron in pagination)
     // The pagination has chevron_left and chevron_right
     const leftChevron = shiftPage.pagination.locator('span', { hasText: 'chevron_left' });
     await expect(leftChevron).toBeVisible();
     
     const rightChevron = shiftPage.pagination.locator('span', { hasText: 'chevron_right' });
     await expect(rightChevron).toBeVisible();
  });
});
