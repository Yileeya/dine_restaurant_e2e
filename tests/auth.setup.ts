import { test as setup, expect } from '@playwright/test';
import { ADMIN_STORAGE_STATE } from '../src/fixtures/auth';

// 後台登入一次並存下登入狀態，後台測試直接載入，不必每支都走登入流程。
// 登入畫面本身由 TC-09 測試，這裡用 API 登入，速度快也不受畫面改版影響。
setup('後台登入', async ({ page }) => {
  const res = await page.request.post('/api/admin/login', {
    data: { username: process.env.ADMIN_USER, password: process.env.ADMIN_PASS },
  });
  expect(res.status(), '後台登入失敗：請確認 .env 的 ADMIN_USER、ADMIN_PASS').toBe(200);
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});
