import { test, expect } from '../../src/fixtures';

// 規格書的「電話 0912345678、D+3 12:30」：改用產生的電話與自動找到的空時段，避免碰到真實訂單

test('[TC-07-1] 重複預約', { tag: ['@BR-07', '@P2'] }, async ({ bookingPage, testData }) => {
  const target = await testData.findEmptySlot();
  const phone = testData.phone();
  await test.step('準備：此電話已訂該時段', () => testData.seedReservation(target, phone));

  await test.step('同電話再訂同一時段', () => bookingPage.book({ name: testData.name(), phone, ...target }));

  await expect(bookingPage.formError).toHaveText('You already have a reservation for this time');
});

test('[TC-07-2] 防止連點', { tag: ['@BR-07', '@P2'] }, async ({ page, bookingPage, testData }) => {
  const target = await testData.findEmptySlot();
  await bookingPage.open();
  await bookingPage.fill({ name: testData.name(), phone: testData.phone(), ...target });

  // 記錄送出預約的請求次數：資料庫本身也會擋同電話重複，只看筆數無法證明前端有防連點
  let submitRequests = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/reservations')) submitRequests++;
  });

  // 先攔住送出的請求，才看得到「送出期間」的按鈕狀態
  let releaseRequest!: () => void;
  const requestHeld = new Promise<void>((resolve) => (releaseRequest = resolve));
  await page.route('**/api/reservations', async (route) => {
    await requestHeld;
    await route.continue();
  });

  await bookingPage.submit.dblclick();
  await expect(bookingPage.submit, '送出期間按鈕停用').toBeDisabled();

  releaseRequest();
  await bookingPage.expectConfirmed();
  expect(submitRequests, '只送出一次').toBe(1);
  expect(await testData.countMine(), '只建立 1 筆預約').toBe(1);
});
