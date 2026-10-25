import { test, expect } from '../../src/fixtures';
import { ADMIN_STORAGE_STATE } from '../../src/fixtures/auth';

test.use({ storageState: ADMIN_STORAGE_STATE });

test('[TC-11-1] 取消刪除', { tag: ['@BR-11', '@P1'] }, async ({ adminPage, testData }) => {
  const target = await testData.findEmptySlot();
  const phone = testData.phone();
  await test.step('準備：1 筆訂單', () => testData.seedReservation(target, phone));

  await adminPage.open();
  await adminPage.search(phone);
  const row = adminPage.rowsWith(phone);

  await adminPage.startDelete(row);
  await expect(adminPage.deleteDialog).toBeVisible();
  await expect(adminPage.deleteDialog).toContainText('Delete this reservation?');
  await adminPage.deleteCancel.click();

  await expect(adminPage.deleteDialog).toBeHidden();
  await expect(row, '訂單仍在列表').toBeVisible();
  expect(await testData.countMine(), '訂單沒有被刪除').toBe(1);
});

test('[TC-11-2] 刪除後釋出名額', { tag: ['@BR-11', '@P1'] }, async ({ adminPage, bookingPage, testData }) => {
  // 規格書的「D+3 12:30」：改用自動找到的空時段
  const target = await testData.findEmptySlot();
  const phone = testData.phone();
  await test.step('準備：時段已有 20 人（含一筆 4 人）', async () => {
    await testData.seed(target, 16);
    await testData.seedReservation(target, phone, 4);
  });

  await test.step('刪除 4 人那筆', async () => {
    await adminPage.open();
    await adminPage.search(phone);
    const row = adminPage.rowsWith(phone);
    await adminPage.startDelete(row);
    await adminPage.deleteConfirm.click();
    await expect(row, '已從列表移除').toHaveCount(0);
  });

  await bookingPage.open();
  await bookingPage.pickDate(target.date);
  await expect(bookingPage.slotRemaining(target.slot)).toHaveText('4 left');
  await expect(bookingPage.slotRadio(target.slot)).toBeEnabled();
});
