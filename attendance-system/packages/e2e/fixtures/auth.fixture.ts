import { Page, APIRequestContext } from '@playwright/test';
import { ApiClient } from '../utils/api-client';

// Define the shape of Auth Fixtures
export type AuthFixtures = {
  api: ApiClient;
  authenticatedPage: Page;
};

// Define the implementation
export const authFixtures = {
  api: async ({ request }: { request: APIRequestContext }, use: (api: ApiClient) => Promise<void>) => {
    const apiClient = new ApiClient(request);
    await use(apiClient);
  },

  authenticatedPage: async ({ page, api }: { page: Page; api: ApiClient }, use: (page: Page) => Promise<void>) => {
    // 1. Login via API to get token
    // Note: Credentials should ideally come from env vars
    // Assuming default admin/123456 for now as per dev env
    const token = await api.login('admin', '123456');

    // 2. Inject token into localStorage
    // We need to navigate to the domain first to set localStorage
    await page.goto('/');
    
    await page.evaluate((t: string) => {
      localStorage.setItem('atn_token', t);
      // Also set user info if needed, but token is usually enough for AuthGuard
      // localStorage.setItem('atn_user', ...); 
    }, token);

    // 3. Reload or navigate to ensure app picks up the token
    await page.goto('/');
    
    // 4. Wait for app to load (optional, but good practice)
    // await page.waitForLoadState('networkidle');

    await use(page);
  },
};
