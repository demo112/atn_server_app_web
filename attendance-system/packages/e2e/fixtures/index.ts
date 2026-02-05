import { test as base, expect } from '@playwright/test';
import { authFixtures, AuthFixtures } from './auth.fixture';
import { dataFixtures, DataFixtures } from './data.fixture';
import { LoginPage } from '../pages/login.page';
import { UserPage } from '../pages/user.page';
import { StatsPage } from '../pages/stats.page';
import { LayoutPage } from '../pages/layout.page';
import { SchedulePage } from '../pages/schedule.page';
import { ShiftPage } from '../pages/shift.page';
import { ClockRecordPage } from '../pages/clock-record.page';

// Combine all fixture types
export type E2EFixtures = AuthFixtures & DataFixtures & {
  loginPage: LoginPage;
  userPage: UserPage;
  statsPage: StatsPage;
  layoutPage: LayoutPage;
  schedulePage: SchedulePage;
  shiftPage: ShiftPage;
  clockRecordPage: ClockRecordPage;
};

// Extend the base test with our fixtures
export const test = base.extend<E2EFixtures>({
  ...authFixtures,
  ...dataFixtures,
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  userPage: async ({ authenticatedPage }, use) => {
    await use(new UserPage(authenticatedPage));
  },
  statsPage: async ({ authenticatedPage }, use) => {
    await use(new StatsPage(authenticatedPage));
  },
  layoutPage: async ({ authenticatedPage }, use) => {
    await use(new LayoutPage(authenticatedPage));
  },
  schedulePage: async ({ authenticatedPage }, use) => {
    await use(new SchedulePage(authenticatedPage));
  },
  shiftPage: async ({ authenticatedPage }, use) => {
    await use(new ShiftPage(authenticatedPage));
  },
  clockRecordPage: async ({ authenticatedPage }, use) => {
    await use(new ClockRecordPage(authenticatedPage));
  },
});

export { expect };
export type { Page, Locator } from '@playwright/test';
