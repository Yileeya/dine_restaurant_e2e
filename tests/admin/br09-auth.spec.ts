import { test, expect } from '@playwright/test';

// 這個檔案測「未登入」的情境，所以不載入後台登入狀態

test('[TC-09-1] 未登入進列表', { tag: ['@BR-09', '@P1'] }, async ({ page }) => {
  await page.goto('/admin/reservations');

  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('[TC-09-2] 帳密錯誤', { tag: ['@BR-09', '@P1'] }, async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByTestId('username').fill(process.env.ADMIN_USER ?? '');
  await page.getByTestId('password').fill('wrong-password');
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('login-error')).toBeVisible();
  await expect(page.getByTestId('login-error')).toHaveText('Invalid username or password');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('[TC-09-3] 未登入呼叫後台 API', { tag: ['@BR-09', '@P1'] }, async ({ request }) => {
  const res = await request.get('/api/admin/reservations');

  expect(res.status()).toBe(401);
});
