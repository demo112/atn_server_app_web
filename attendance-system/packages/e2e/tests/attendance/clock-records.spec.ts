import { test, expect } from '../../fixtures';

test.describe('Attendance - Clock Records', () => {
  test.beforeEach(async ({ clockRecordPage }) => {
    await clockRecordPage.goto();
  });

  test('should allow selecting date range', async ({ clockRecordPage }) => {
    await expect(clockRecordPage.startTimeInput).toBeVisible();
    await expect(clockRecordPage.endTimeInput).toBeVisible();
    
    // Set value
    await clockRecordPage.startTimeInput.fill('2024-01-01T09:00');
    await clockRecordPage.endTimeInput.fill('2024-01-01T18:00');
    
    await expect(clockRecordPage.startTimeInput).toHaveValue('2024-01-01T09:00');
    await expect(clockRecordPage.endTimeInput).toHaveValue('2024-01-01T18:00');
  });
  
  test('should have search button', async ({ clockRecordPage }) => {
    await expect(clockRecordPage.searchButton).toBeVisible();
    await expect(clockRecordPage.searchButton).toBeEnabled();
  });
});
