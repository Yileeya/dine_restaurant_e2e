// 測試共用的 fixture：測試檔改從這裡 import { test, expect }，就能直接使用 testData 與各頁面的 Page Object。
import { test as base, expect } from '@playwright/test';
import { AdminApi } from '../api/reservations';
import { AdminReservationsPage } from '../pages/AdminReservationsPage';
import { BookingPage } from '../pages/BookingPage';
import { TestData } from './testData';

type TestFixtures = {
  testData: TestData;
  bookingPage: BookingPage;
  adminPage: AdminReservationsPage;
};
type WorkerFixtures = { admin: AdminApi };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // 後台登入：每個 worker 只登入一次，供清除資料使用
  admin: [
    async ({ playwright }, use, workerInfo) => {
      const request = await playwright.request.newContext({ baseURL: workerInfo.project.use.baseURL });
      await use(await AdminApi.login(request));
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  // 測試資料：測試結束後（無論成敗）自動清除本支測試建立的資料
  testData: async ({ request, admin }, use, testInfo) => {
    const testData = new TestData(request, admin, testInfo);
    await use(testData);
    await testData.cleanup();
  },

  bookingPage: async ({ page }, use) => {
    await use(new BookingPage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminReservationsPage(page));
  },
});

export { expect };
