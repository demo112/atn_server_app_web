import { TestDataFactory } from '../utils/test-data';
import { AuthFixtures } from './auth.fixture';

export type DataFixtures = {
  workerPrefix: string;
  testData: TestDataFactory;
  autoClean: void;
};

type Fixtures = AuthFixtures & DataFixtures;

export const dataFixtures = {
  workerPrefix: async ({}, use: (r: string) => Promise<void>, workerInfo: any) => {
    const prefix = `[W${workerInfo.workerIndex}]`;
    await use(prefix);
  },

  testData: async ({ workerPrefix }: Fixtures, use: (r: TestDataFactory) => Promise<void>) => {
    const workerIndex = parseInt(workerPrefix.replace(/\D/g, ''), 10);
    const factory = new TestDataFactory(workerIndex);
    await use(factory);
  },

  autoClean: [async ({ api, testData }: any, use: () => Promise<void>) => {
    await use();
    console.log(`[AutoClean] Cleaning up data for prefix: ${testData.prefix}`);
    try {
      // Ensure we are logged in for cleanup
      await api.login('admin', '123456');
      await api.cleanupTestData(testData.prefix);
    } catch (e) {
      console.warn(`[AutoClean] Cleanup failed:`, e);
    }
  }, { auto: true }],
};
