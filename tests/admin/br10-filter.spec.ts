import { test, expect } from '../../src/fixtures';
import { ADMIN_STORAGE_STATE } from '../../src/fixtures/auth';

test.use({ storageState: ADMIN_STORAGE_STATE });

// 受測網站可能有其他訂單，所以不檢查總筆數，改為檢查「自己建立的資料符合預期，且每一列都符合篩選條件」

test('[TC-10-1] 依日期篩選', { tag: ['@BR-10', '@P2'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  const other = await testData.findEmptySlot({ excludeDate: target.date });
  await test.step('準備：目標日期 2 筆、另一天 1 筆', async () => {
    await testData.seedReservation(target, testData.phone());
    await testData.seedReservation(target, testData.phone());
    await testData.seedReservation(other, testData.phone());
  });

  await page.goto('/admin/reservations');
  await page.getByTestId('filter-date').fill(target.date);
  await page.getByTestId('filter-apply').click();

  const rows = page.getByTestId('reservation-row');
  await expect(rows.filter({ hasText: testData.marker }), '自己建立的只顯示目標日期的 2 筆').toHaveCount(2);
  const dates = await rows.locator('td:first-child').allTextContents();
  expect(dates.every((date) => date === target.date), '每一列都是目標日期').toBe(true);
});

test('[TC-10-2] 依電話篩選', { tag: ['@BR-10', '@P2'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  const phones = [testData.phone(), testData.phone(), testData.phone()];
  await test.step('準備：3 筆不同電話', async () => {
    for (const phone of phones) await testData.seedReservation(target, phone);
  });

  await page.goto('/admin/reservations');
  await page.getByTestId('filter-q').fill(phones[0]);
  await page.getByTestId('filter-apply').click();

  const rows = page.getByTestId('reservation-row');
  await expect(rows.filter({ hasText: testData.marker }), '自己建立的只顯示搜尋的那筆').toHaveCount(1);
  const shownPhones = await rows.locator('td:nth-child(4)').allTextContents();
  expect(shownPhones.every((phone) => phone === phones[0]), '每一列都是搜尋的電話').toBe(true);
});
