import { test, expect } from '../../src/fixtures';
import { ADMIN_STORAGE_STATE } from '../../src/fixtures/auth';

test.use({ storageState: ADMIN_STORAGE_STATE });

test('[TC-11-1] 取消刪除', { tag: ['@BR-11', '@P1'] }, async ({ page, testData }) => {
  const target = await testData.findEmptySlot();
  const phone = testData.phone();
  await test.step('準備：1 筆訂單', () => testData.seedReservation(target, phone));

  await page.goto('/admin/reservations');
  await page.getByTestId('filter-q').fill(phone);
  await page.getByTestId('filter-apply').click();
  const row = page.getByTestId('reservation-row').filter({ hasText: phone });

  await row.getByTestId('delete-button').click();
  await expect(page.getByTestId('delete-dialog')).toBeVisible();
  await expect(page.getByTestId('delete-dialog')).toContainText('Delete this reservation?');
  await page.getByTestId('delete-cancel').click();

  await expect(page.getByTestId('delete-dialog')).toBeHidden();
  await expect(row, '訂單仍在列表').toBeVisible();
  expect(await testData.countMine(), '訂單沒有被刪除').toBe(1);
});

test('[TC-11-2] 刪除後釋出名額', { tag: ['@BR-11', '@P1'] }, async ({ page, testData }) => {
  // 規格書的「D+3 12:30」：改用自動找到的空時段
  const target = await testData.findEmptySlot();
  const phone = testData.phone();
  await test.step('準備：時段已有 20 人（含一筆 4 人）', async () => {
    await testData.seed(target, 16);
    await testData.seedReservation(target, phone, 4);
  });

  await test.step('刪除 4 人那筆', async () => {
    await page.goto('/admin/reservations');
    await page.getByTestId('filter-q').fill(phone);
    await page.getByTestId('filter-apply').click();
    const row = page.getByTestId('reservation-row').filter({ hasText: phone });
    await row.getByTestId('delete-button').click();
    await page.getByTestId('delete-confirm').click();
    await expect(row, '已從列表移除').toHaveCount(0);
  });

  await page.goto('/');
  await page.getByTestId('date').fill(target.date);
  await expect(page.getByTestId(`slot-${target.slot}-remaining`)).toHaveText('4 left');
  await expect(page.getByTestId(`slot-${target.slot}`).getByRole('radio')).toBeEnabled();
});
