import { test as base, expect } from '@playwright/test';
import { authFixtures, AuthFixtures } from './auth.fixture';
import { dataFixtures, DataFixtures } from './data.fixture';
import { LoginPage } from '../pages/login.page';

// Combine all fixture types
export type E2EFixtures = AuthFixtures & DataFixtures & {
  loginPage: LoginPage;
};

// Extend the base test with our fixtures
export const test = base.extend<E2EFixtures>({
  ...authFixtures,
  ...dataFixtures,
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
export type { Page, Locator } from '@playwright/test';
