import { Page } from '@playwright/test';
import { test, expect } from '../../src/fixtures';
import { SlotTarget, TestData } from '../../src/fixtures/testData';

// 規格書的「電話 0912345678、D+3 12:30」：改用產生的電話與自動找到的空時段，避免碰到真實訂單
async function fillBookingForm(page: Page, testData: TestData, target: SlotTarget, phone: string) {
  await page.goto('/');
  await page.getByTestId('name').fill(testData.name());
  await page.getByTestId('phone').fill(phone);
  await page.getByTestId('date').fill(target.date);
  await page.getByTestId(`slot-${target.slot}`).getByRole('radio').check();
}

test('[TC-07-1] 重複預約', { tag: ['@BR-07', '@P2'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  const phone = testData.phone();
  await test.step('準備：此電話已訂該時段', () => testData.seedReservation(target, phone));

  await test.step('同電話再訂同一時段', async () => {
    await fillBookingForm(page, testData, target, phone);
    await page.getByTestId('submit').click();
  });

  await expect(page.getByTestId('form-error')).toHaveText('You already have a reservation for this time');
});

test('[TC-07-2] 防止連點', { tag: ['@BR-07', '@P2'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  await fillBookingForm(page, testData, target, testData.phone());

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

  const submit = page.getByTestId('submit');
  await submit.dblclick();
  await expect(submit, '送出期間按鈕停用').toBeDisabled();

  releaseRequest();
  // 成功區塊一開始就在網頁裡（隱藏），必須先確認它顯示出來，才代表預約真的完成
  await expect(page.getByTestId('success')).toBeVisible();
  await expect(page.getByTestId('success')).toContainText('Reservation confirmed');
  expect(submitRequests, '只送出一次').toBe(1);
  expect(await testData.countMine(), '只建立 1 筆預約').toBe(1);
});
