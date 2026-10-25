import { test, expect } from '../../src/fixtures';

// 規格書的前置資料「D+3 12:30 已有 15 人」：受測網站可能有其他訂單，改為自動找一個空時段再塞到 15 人

test('[TC-06-1] 剛好訂滿', { tag: ['@BR-06', '@P1'] }, async ({ bookingPage, testData }) => {
  const target = await testData.findEmptySlot();
  await test.step('準備：時段已有 15 人', () => testData.seed(target, 15));

  await test.step('訂 5 人', () =>
    bookingPage.book({ name: testData.name(), phone: testData.phone(), ...target, guests: 5 }));
  await bookingPage.expectConfirmed();

  await test.step('該時段變為 Full', async () => {
    await bookingPage.open();
    await bookingPage.pickDate(target.date);
    await expect(bookingPage.slotRemaining(target.slot)).toHaveText('Full');
  });
});

test('[TC-06-2] 超過上限 1 人', { tag: ['@BR-06', '@P1'] }, async ({ bookingPage, testData }) => {
  const target = await testData.findEmptySlot();
  await test.step('準備：時段已有 15 人', () => testData.seed(target, 15));
  const countBefore = await testData.countMine();

  await test.step('訂 6 人', () =>
    bookingPage.book({ name: testData.name(), phone: testData.phone(), ...target, guests: 6 }));
  await expect(bookingPage.formError).toHaveText('Only 5 seats left for this time');
  expect(await testData.countMine(), '資料庫筆數不變').toBe(countBefore);
});
