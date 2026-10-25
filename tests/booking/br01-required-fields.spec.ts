import { test, expect } from '@playwright/test';

test('[TC-01-1] 全部欄位空白送出', { tag: ['@BR-01', '@P1'] }, async ({ page }) => {
  // 記錄送出預約的 API 請求，用來確認前端有擋下來
  const reservationRequests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/reservations')) {
      reservationRequests.push(request.url());
    }
  });

  await page.goto('/');
  await page.getByTestId('submit').click();

  await expect(page.getByTestId('name-error')).toHaveText('This field is required');
  await expect(page.getByTestId('phone-error')).toHaveText('This field is required');
  await expect(page.getByTestId('date-error')).toHaveText('This field is required');
  await expect(page.getByTestId('slot-error')).toHaveText('This field is required');
  expect(reservationRequests).toHaveLength(0);
});
