import { test, expect } from '../fixtures';

test.describe('Fixtures Verification', () => {
  
  test('workerPrefix should match pattern', async ({ workerPrefix }, testInfo) => {
    console.log(`Worker Prefix: ${workerPrefix}`);
    expect(workerPrefix).toBe(`[W${testInfo.workerIndex}]`);
  });

  test('testData should use workerPrefix', async ({ testData, workerPrefix }) => {
    expect(testData.prefix).toBe(workerPrefix);
    const emp = testData.generateEmployee();
    expect(emp.name).toContain(workerPrefix);
  });

  // This test requires backend to be running for login
  // We skip it if we are just verifying structure, but ideally we run it.
  // We can mock the API response if we want to test just the fixture logic without backend?
  // But ApiClient is not using Playwright's route mocking, it uses request context.
  // We can't easily mock request context inside the fixture without intercepting at network level.
  // Let's assume the server is NOT running and skip this test or try it.
  // Actually, we can check if we can mock the login in ApiClient?
  // No, ApiClient is a class.
  // For now, let's just test the non-auth fixtures to be safe, 
  // and add a skipped test for auth that requires env.
  
  test('authenticatedPage should have token', async ({ authenticatedPage }) => {
    // This will fail if login fails.
    // We check if token exists in localStorage
    const token = await authenticatedPage.evaluate(() => localStorage.getItem('atn_token'));
    expect(token).toBeTruthy();
  });
});
