import { test, expect } from '../../src/fixtures';

test('[TC-01-1] 全部欄位空白送出', { tag: ['@BR-01', '@P1'] }, async ({ page, bookingPage }) => {
  // 記錄送出預約的 API 請求，用來確認前端有擋下來
  const reservationRequests: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/reservations')) {
      reservationRequests.push(request.url());
    }
  });

  await bookingPage.open();
  await bookingPage.submit.click();

  await expect(bookingPage.fieldError('name')).toHaveText('This field is required');
  await expect(bookingPage.fieldError('phone')).toHaveText('This field is required');
  await expect(bookingPage.fieldError('date')).toHaveText('This field is required');
  await expect(bookingPage.fieldError('slot')).toHaveText('This field is required');
  expect(reservationRequests).toHaveLength(0);
});
